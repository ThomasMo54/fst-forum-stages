package fr.fst.forumstages.backend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Données pour le rafraîchissement du token JWT.")
public record RefreshDto(
    @Schema(description = "Le token de rafraîchissement")
    @NotBlank
    String refreshToken
) {}
