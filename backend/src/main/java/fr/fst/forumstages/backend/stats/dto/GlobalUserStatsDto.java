package fr.fst.forumstages.backend.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Données globales sur les utilisateurs du forum.")
public record GlobalUserStatsDto(
        @Schema(description = "Le nombre total d'étudiants inscrits sur le forum")
        Long totalStudents,

        @Schema(description = "Le nombre total d'entreprises inscrites sur le forum")
        Long totalCompanies
) {}
