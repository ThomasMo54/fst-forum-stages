package fr.fst.forumstages.backend.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Données sur les candidatures du forum, permettant de suivre l'évolution du nombre de candidatures au fil du temps. Le nombre d'éléments dans la liste dépend de la période choisie (par exemple, 7 éléments pour une semaine).")
public record TemporalApplicationStatsDto(
        @Schema(description = "Le nombre de candidatures créées dans la période choisie")
        List<Long> applications
) {}
