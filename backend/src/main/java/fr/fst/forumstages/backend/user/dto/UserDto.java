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
    UserRole role
) {

    public static UserDto fromEntity(UserEntity userEntity) {
        return new UserDto(
                userEntity.getId(),
                userEntity.getEmail(),
                userEntity.getRole()
        );
    }
}
