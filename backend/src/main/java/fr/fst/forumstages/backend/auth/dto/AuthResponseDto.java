package fr.fst.forumstages.backend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Réponse d'authentification contenant le token JWT et le token de rafraîchissement.")
public record AuthResponseDto(
    @Schema(description = "Le token JWT")
    @NotBlank
    String token,

    @Schema(description = "Le token de rafraîchissement")
    @NotBlank
    String refreshToken
) {}
