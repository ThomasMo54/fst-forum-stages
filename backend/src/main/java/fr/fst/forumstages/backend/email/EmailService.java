package fr.fst.forumstages.backend.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public static final long EXPIRY_DURATION_MS = 15 * 60 * 1000; // 15 minutes

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailService(JavaMailSender mailSender, @Value("${spring.mail.username}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    @Async
    public void sendVerificationEmail(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("Vérification de votre adresse e-mail");
        message.setText("Veuillez utiliser le code suivant pour vérifier votre adresse e-mail :\n\n " + code + "\n\nCe code expirera dans 15 minutes.");
        mailSender.send(message);
    }
}
