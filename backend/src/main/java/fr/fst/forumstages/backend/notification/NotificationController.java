package fr.fst.forumstages.backend.notification;

import fr.fst.forumstages.backend.notification.dto.MarkAsReadDto;
import fr.fst.forumstages.backend.notification.dto.NotificationDto;
import fr.fst.forumstages.backend.user.UserEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@Tag(name = "Notifications", description = "Endpoints pour la gestion des notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Operation(summary = "Récupérer toutes les notifications de l'utilisateur connecté")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Notifications récupérées avec succès")
    })
    @GetMapping
    public List<NotificationDto> getMyNotifications(Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return notificationService.getUserNotifications(user.getId())
                .stream()
                .map(NotificationDto::fromEntity)
                .toList();
    }

    @Operation(summary = "Récupérer les notifications non lues de l'utilisateur connecté")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Notifications non lues récupérées avec succès")
    })
    @GetMapping("/unread")
    public List<NotificationDto> getUnreadNotifications(Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return notificationService.getUnreadNotifications(user.getId())
                .stream()
                .map(NotificationDto::fromEntity)
                .toList();
    }

    @Operation(summary = "Obtenir le nombre de notifications non lues")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Nombre de notifications non lues récupéré avec succès")
    })
    @GetMapping("/unread/count")
    public Map<String, Long> getUnreadCount(Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        long count = notificationService.getUnreadCount(user.getId());
        return Map.of("count", count);
    }

    @Operation(summary = "Marquer une notification comme lue")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Notification marquée comme lue"),
            @ApiResponse(responseCode = "404", description = "Notification non trouvée")
    })
    @PutMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
    }

    @Operation(summary = "Marquer plusieurs notifications comme lues")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Notifications marquées comme lues")
    })
    @PutMapping("/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markMultipleAsRead(@Valid @RequestBody MarkAsReadDto dto) {
        notificationService.markMultipleAsRead(dto.notificationIds());
    }

    @Operation(summary = "Marquer toutes les notifications comme lues")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Toutes les notifications marquées comme lues")
    })
    @PutMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllAsRead(Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        notificationService.markAllAsRead(user.getId());
    }

    @Operation(summary = "Supprimer une notification")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Notification supprimée"),
            @ApiResponse(responseCode = "404", description = "Notification non trouvée")
    })
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id);
    }
}