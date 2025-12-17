package com.waad.tba.modules.auth.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.waad.tba.common.exception.ResourceNotFoundException;
import com.waad.tba.core.email.EmailService;
import com.waad.tba.modules.auth.dto.LoginRequest;
import com.waad.tba.modules.auth.dto.LoginResponse;
import com.waad.tba.modules.auth.dto.RegisterRequest;
import com.waad.tba.modules.auth.model.PasswordResetToken;
import com.waad.tba.modules.auth.repository.PasswordResetTokenRepository;
import com.waad.tba.modules.rbac.entity.Role;
import com.waad.tba.modules.rbac.entity.User;
import com.waad.tba.modules.rbac.repository.UserRepository;
import com.waad.tba.security.JwtTokenProvider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String identifier = request.getIdentifier();
        log.info("Login attempt for identifier: {}", identifier);

        // Find user by username or email (identifier can be either)
        User user = userRepository.findByUsernameOrEmail(identifier, identifier)
                .orElseThrow(() -> {
                    log.error("User not found with identifier: {}", identifier);
                    return new RuntimeException("Invalid email or password");
                });

        if (!user.getActive()) {
            log.error("Inactive user attempted login: {}", user.getEmail());
            throw new RuntimeException("Account is not active");
        }

        // Authenticate
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
        );

        if (!authentication.isAuthenticated()) {
            log.error("Authentication failed for user: {}", user.getEmail());
            throw new RuntimeException("Invalid email or password");
        }

        // Extract roles only (no permissions)
        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(user);

        log.info("Login successful for user: {}", user.getUsername());

        return LoginResponse.builder()
                .token(token)
                .user(LoginResponse.UserInfo.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .roles(roles)
                        .employerId(user.getEmployerId())
                        .companyId(user.getCompanyId())
                        .build())
                .build();
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        log.info("Registration attempt for username: {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .active(true)
                .build();

        user = userRepository.save(user);
        log.info("User registered successfully: {}", user.getUsername());

        // Auto-login after registration
        LoginRequest loginRequest = LoginRequest.builder()
                .identifier(request.getUsername())
                .password(request.getPassword())
                .build();

        return login(loginRequest);
    }

    /**
     * Get current authenticated user info
     * Simplified - Role-based only (no permissions)
     */
    @Transactional(readOnly = true)
    public LoginResponse.UserInfo getCurrentUser(String token) {
        String username = jwtTokenProvider.getUsernameFromToken(token);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        return LoginResponse.UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .roles(roles)
                .employerId(user.getEmployerId())
                .companyId(user.getCompanyId())
                .build();
    }

    /**
     * Get user info by username (for session-based auth)
     * Phase A - Session Auth Support
     */
    @Transactional(readOnly = true)
    public LoginResponse.UserInfo getUserInfo(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        return LoginResponse.UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .roles(roles)
                .employerId(user.getEmployerId())
                .companyId(user.getCompanyId())
                .build();
    }

    @Transactional
    public void sendResetOtp(String email) {
        log.info("Password reset OTP request for email: {}", email);

        // 1) Check if user exists by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // 2) Generate 6-digit OTP
        String otp = "%06d".formatted(new Random().nextInt(1_000_000));

        // 3) Compute expiry = now + 10 minutes
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(10);

        // 4) Remove any existing token for this email
        passwordResetTokenRepository.deleteByEmail(email);

        // 5) Save new token
        PasswordResetToken token = PasswordResetToken.builder()
                .email(email)
                .otp(otp)
                .expiryTime(expiry)
                .build();
        passwordResetTokenRepository.save(token);

        // 6) Send email using EmailService
        String subject = "TBA-WAAD Password Reset OTP";
        String body = String.format(
                """
                Dear %s,
                
                You have requested to reset your password.
                
                Your OTP code is: %s
                
                This code will expire in 10 minutes.
                
                If you did not request this, please ignore this email.
                
                Best regards,
                TBA-WAAD System""",
                user.getFullName(), otp
        );

        emailService.sendOtpTemplate(email, user.getFullName(), otp);
        log.info("Password reset OTP sent successfully to: {}", email);
    }

    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        log.info("Password reset attempt for email: {}", email);

        // 1) Load token by email
        PasswordResetToken token = passwordResetTokenRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No reset request found for this email"));

        // 2) Validate OTP
        if (!token.getOtp().equals(otp)) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        // 3) Validate expiry
        if (token.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired");
        }

        // 4) Load user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // 5) Encode password and save user
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // 6) Delete token record for this email
        passwordResetTokenRepository.deleteByEmail(email);

        log.info("Password reset successfully for user: {}", user.getUsername());
    }
}
