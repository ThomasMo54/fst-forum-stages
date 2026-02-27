package fr.fst.forumstages.backend.user.dto;

import fr.fst.forumstages.backend.user.UserEntity;
import fr.fst.forumstages.backend.user.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Données d'un utilisateur.")
public record UserDto(
        @Schema(description = "L'identifiant unique de l'utilisateur")
        @NotBlank
        String id,

        @Schema(description = "L'email de l'utilisateur")
        @NotBlank @Email
        String email,

        @Schema(description = "Le rôle de l'utilisateur")
        @NotBlank
        UserRole role,

        @Schema(description = "La date de création de l'utilisateur")
        @NotBlank
        String createdAt,

        @Schema(description = "L'identifiant de l'entité associée (étudiant ou entreprise)")
        String entityId
) {

    public static UserDto fromEntity(UserEntity userEntity) {
        String entityId = null;
        if (userEntity.getStudent() != null) {
            entityId = userEntity.getStudent().getId();
        } else if (userEntity.getCompany() != null) {
            entityId = userEntity.getCompany().getId();
        }

        return new UserDto(
                userEntity.getId(),
                userEntity.getEmail(),
                userEntity.getRole(),
                userEntity.getCreatedAt().toString(),
                entityId
        );
    }
}