package fr.fst.forumstages.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthResponseDto(
    @NotBlank
    String token,

    @NotBlank
    String refreshToken
) {}
