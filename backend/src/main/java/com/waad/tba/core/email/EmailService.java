package com.waad.tba.core.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    // Send plain text
    public void sendText(String to, String subject, String body) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setFrom("TBA-WAAD System <support@alwahacare.com>");
            msg.setSubject(subject);
            msg.setText(body);

            mailSender.send(msg);
            log.info("Text email sent to {}", to);

        } catch (Exception ex) {
            log.error("Text email failed: {}", ex.getMessage());
            throw new RuntimeException("Failed to send email");
        }
    }
    // Backwards compatibility: generic send method
    public void send(String to, String subject, String body) {
        sendText(to, subject, body);
    }
    // Send HTML email
    public void sendHtml(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                            StandardCharsets.UTF_8.name());

            helper.setTo(to);
            helper.setFrom("TBA-WAAD System <support@alwahacare.com>");
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(message);
            log.info("HTML email sent to {}", to);

        } catch (Exception ex) {
            log.error("HTML email failed: {}", ex.getMessage());
            throw new RuntimeException("Failed to send HTML email");
        }
    }

    // Send OTP template
    public void sendOtpTemplate(String to, String fullName, String otp) {
        try {
            ClassPathResource resource = new ClassPathResource("templates/email/email-otp.html");
            String template = Files.readString(resource.getFile().toPath());

            String html = template
                    .replace("{{fullName}}", fullName)
                    .replace("{{otp}}", otp);

            sendHtml(to, "TBA-WAAD Password Reset OTP", html);

        } catch (Exception ex) {
            log.error("Failed to send OTP email: {}", ex.getMessage());
            throw new RuntimeException("OTP email sending failed");
        }
    }
}
