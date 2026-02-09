package fr.fst.forumstages.backend.notification.dto;

import fr.fst.forumstages.backend.notification.NotificationEntity;
import fr.fst.forumstages.backend.notification.NotificationType;
import java.time.LocalDateTime;

public record NotificationDto(
        String id,
        String userId,
        NotificationType type,
        String title,
        String message,
        boolean isRead,
        LocalDateTime createdAt,
        String applicationId,
        String offerId
) {
    public static NotificationDto fromEntity(NotificationEntity entity) {
        return new NotificationDto(
                entity.getId(),
                entity.getUser().getId(),
                entity.getType(),
                entity.getTitle(),
                entity.getMessage(),
                entity.isRead(),
                entity.getCreatedAt(),
                entity.getApplication() != null ? entity.getApplication().getId() : null,
                entity.getOffer() != null ? entity.getOffer().getId() : null
        );
    }
}