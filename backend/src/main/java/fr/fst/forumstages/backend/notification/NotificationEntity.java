package fr.fst.forumstages.backend.notification;

import fr.fst.forumstages.backend.application.ApplicationEntity;
import fr.fst.forumstages.backend.offer.OfferEntity;
import fr.fst.forumstages.backend.user.UserEntity;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "notifications")
public class NotificationEntity {
    @Id
    private String id;

    @DBRef
    private UserEntity user;

    private NotificationType type;

    private String title;

    private String message;

    private boolean isRead = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Relations optionnelles selon le type de notification
    @DBRef
    private ApplicationEntity application; // Si lié à une candidature

    @DBRef
    private OfferEntity offer; // Si lié à une offre
}