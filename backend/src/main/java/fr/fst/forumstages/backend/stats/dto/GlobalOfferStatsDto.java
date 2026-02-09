package fr.fst.forumstages.backend.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Données globales sur les offres de stage du forum.")
public record GlobalOfferStatsDto(
        @Schema(description = "Le nombre total d'offres de stage publiées sur le forum")
        Long totalOffers
) {}
