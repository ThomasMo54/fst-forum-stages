package fr.fst.forumstages.backend.application.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateApplicationDto(@NotBlank() String studentId, @NotBlank() String offerId) {}
