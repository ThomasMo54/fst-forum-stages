package fr.fst.forumstages.backend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Données de connexion pour l'authentification d'un utilisateur.")
public record LoginDto(
    @Schema(description = "L'email de l'utilisateur")
    @NotBlank @Email
    String email,

    @Schema(description = "Le mot de passe de l'utilisateur")
    @NotBlank
    String password
) {}
