package fr.fst.forumstages.backend.notification.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record MarkAsReadDto(
        @NotEmpty List<String> notificationIds
) {}