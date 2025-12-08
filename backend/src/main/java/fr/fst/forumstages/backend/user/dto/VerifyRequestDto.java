package fr.fst.forumstages.backend.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import org.hibernate.validator.constraints.Length;

@Schema(description = "Données pour la vérification d'un utilisateur.")
public record VerifyRequestDto(
        @Schema(description = "L'email de l'utilisateur à vérifier")
        @Email(message = "Email must be a valid email address")
        String email,

        @Schema(description = "Le code de vérification")
        @Length(min = 6, max = 6, message = "Verification code must be 6 characters long")
        String verificationCode
) { }
