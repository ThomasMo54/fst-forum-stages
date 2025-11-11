package fr.fst.forumstages.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshDto(
    @NotBlank
    String refreshToken
) {}
