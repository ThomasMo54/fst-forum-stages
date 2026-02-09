package fr.fst.forumstages.backend.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Données globales sur les candidatures du forum.")
public record GlobalApplicationStatsDto(
        @Schema(description = "Le nombre total de candidatures déposées sur le forum")
        Long totalApplications
) {}
