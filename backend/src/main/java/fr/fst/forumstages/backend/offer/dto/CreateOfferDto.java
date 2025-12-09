package fr.fst.forumstages.backend.offer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Données pour la création d'une offre.")
public record CreateOfferDto(
        @Schema(description = "Le titre de l'offre")
        @NotBlank(message = "Title must not be blank")
        @Length(max = 200, message = "Title must be shorter or equal to 100 characters")
        String title,

        @Schema(description = "La description de l'offre")
        @NotBlank(message = "Description must not be blank")
        String description,

        @Schema(description = "La liste des étiquettes de l'offre")
        List<String> tags,

        @Schema(description = "Le salaire de l'offre")
        String salary,

        @Schema(description = "La date du début du stage")
        LocalDate internshipStartDate,

        @Schema(description = "La durée du stage")
        String internshipDuration,

        @Schema(description = "La date limite de candidature")
        LocalDate limitApplicationDate,

        @Schema(description = "Le niveau d'étude minimale nécéssaire (exemple : L3 ou M2...")
        String studyLevel,

        @Schema(description = "La politique de télétravail (exemple : un jour par semaine")
        String remoteWorkPolicy,

        @Schema(description = "L'identifiant de l'entreprise proposant l'offre")
        @NotBlank(message = "CompanyId must not be blank")
        String companyId
) {
}
