package fr.fst.forumstages.backend.offer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

import java.util.Date;
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

        List<String> tags,

        String salary,

        Date internshipStartDate,

        Date internshipDuration,

        Date limitApplicationDate,

        String studyLevel,

        String remoteWorkPolicy,

        @Schema(description = "L'identifiant de l'entreprise proposant l'offre")
        @NotBlank(message = "CompanyId must not be blank")
        String companyId
) {
}
