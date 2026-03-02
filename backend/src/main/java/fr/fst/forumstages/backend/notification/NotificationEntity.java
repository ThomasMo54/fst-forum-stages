package fr.fst.forumstages.backend.notification;

import fr.fst.forumstages.backend.application.ApplicationEntity;
import fr.fst.forumstages.backend.offer.OfferEntity;
import fr.fst.forumstages.backend.user.UserEntity;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Field;

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

    @DBRef(lazy = true)
    @Field(write = Field.Write.NON_NULL)
    private ApplicationEntity application;

    @DBRef(lazy = true)
    @Field(write = Field.Write.NON_NULL)
    private OfferEntity offer;

    @DBRef(lazy = true)
    @Field(write = Field.Write.NON_NULL)
    private UserEntity relatedUser;   // ← nouveau champ pour l'étudiant / entreprise qui vient de s'inscrire
}