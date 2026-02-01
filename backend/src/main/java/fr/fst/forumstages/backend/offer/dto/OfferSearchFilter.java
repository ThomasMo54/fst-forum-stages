package fr.fst.forumstages.backend.offer.dto;

import java.time.LocalDate;
import java.util.List;

public record OfferSearchFilter(
        String query,
        List<String> tags,
        String studyLevel,
        String remotePolicy,
        LocalDate startDateFrom,
        LocalDate startDateTo,
        LocalDate limitDateFrom,
        LocalDate limitDateTo,
        String companyId
) {
}
