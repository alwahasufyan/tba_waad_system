package com.waad.tba.security;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.waad.tba.modules.rbac.entity.User;
import com.waad.tba.modules.rbac.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * SessionAuthenticationFilter - Phase B: Dual Auth Support
 * AUDIT FIX (TASK A): Load roles from DB on each request, not from session
 * 
 * This filter runs BEFORE JwtAuthenticationFilter to check for session-based authentication.
 * If a valid HTTP session exists with user data, it authenticates the request.
 * Otherwise, it passes through to JWT filter for backward compatibility.
 * 
 * Priority:
 * 1. If SecurityContext already has auth -> skip (already authenticated)
 * 2. If valid session with user -> load roles from DB and authenticate
 * 3. Otherwise -> pass to JWT filter
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SessionAuthenticationFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        // Skip if already authenticated (e.g., by JWT filter in previous request)
        if (SecurityContextHolder.getContext().getAuthentication() != null &&
                SecurityContextHolder.getContext().getAuthentication().isAuthenticated()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Check for HTTP session
            HttpSession session = request.getSession(false);
            
            if (session != null && session.getAttribute("userId") != null) {
                // Extract user info from session
                Long userId = (Long) session.getAttribute("userId");
                String username = (String) session.getAttribute("username");
                
                if (username != null) {
                    // AUDIT FIX (TASK A): Load user from DB to get CURRENT roles
                    // This ensures role changes take effect immediately without re-login
                    User user = userRepository.findByUsername(username)
                            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
                    
                    // Get current roles from database
                    List<String> roleNames = user.getRoles().stream()
                            .map(role -> role.getName())
                            .collect(Collectors.toList());
                    
                    // Convert role names to authorities
                    List<SimpleGrantedAuthority> authorities = roleNames.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList());
                    
                    // Create authentication token
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(username, null, authorities);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Set authentication in SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    // AUDIT FIX (TASK A): Log that roles were loaded from DB
                    log.debug("✅ Session auth successful - User: {}, Roles loaded from DB: {}, Path: {}", 
                        username, 
                        roleNames, 
                        request.getRequestURI()
                    );
                }
            }
        } catch (Exception ex) {
            log.error("Could not set session-based authentication in security context", ex);
            // Continue to JWT filter - don't fail the request
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Skip filter for public endpoints
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Skip for public endpoints (they're already permitted in SecurityConfig)
        return path.startsWith("/api/auth/login") ||
               path.startsWith("/api/auth/register") ||
               path.startsWith("/api/auth/forgot-password") ||
               path.startsWith("/api/auth/reset-password") ||
               path.startsWith("/swagger") ||
               path.startsWith("/v3/api-docs");
    }
}
