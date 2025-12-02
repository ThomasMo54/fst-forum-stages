package fr.fst.forumstages.backend.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

@Schema(description = "Données pour la création d'un utilisateur administrateur.")
public record CreateAdminUserDto(
    @Schema(description = "L'email de l'utilisateur")
    @NotBlank @Email(message = "Email must be a valid email address")
    String email,

    @Schema(description = "Le mot de passe de l'utilisateur")
    @NotBlank @Length(min = 8, max = 200, message = "Password must be between 8 and 200 characters long")
    String password
) {}
