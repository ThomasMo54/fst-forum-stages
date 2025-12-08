package fr.fst.forumstages.backend.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;

public record RefreshVerificationCodeDto(
        @Schema(description = "L'email de l'utilisateur à qui renvoyer le code de vérification")
        @Email(message = "Email must be a valid email address")
        String email
) { }
