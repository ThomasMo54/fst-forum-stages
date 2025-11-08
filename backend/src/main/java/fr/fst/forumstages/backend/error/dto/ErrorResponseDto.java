package fr.fst.forumstages.backend.error.dto;

public record ErrorResponseDto(
    int status,
    String error,
    String message
) {}
