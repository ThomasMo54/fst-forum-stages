package fr.fst.forumstages.backend.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Données sur les utilisateurs du forum, permettant de suivre l'évolution du nombre d'inscriptions au fil du temps. Le nombre d'éléments dans les listes dépend de la période choisie (par exemple, 7 éléments pour une semaine).")
public record TemporalUserStatsDto(
        @Schema(description = "Le nombre d'étudiants inscrits sur le forum dans la période choisie")
        List<Long> students,

        @Schema(description = "Le nombre d'entreprises inscrites sur le forum dans la période choisie")
        List<Long> companies
) {}
