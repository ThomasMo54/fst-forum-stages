package fr.fst.forumstages.backend.offer.dto;

import fr.fst.forumstages.backend.offer.OfferEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "Données d'une offre.")
public record OfferDto(
        @Schema(description = "L'identifiant de l'offre")
        @NotBlank
        String id,

        @Schema(description = "Le titre de l'offre")
        @NotBlank @Length(max = 200)
        String title,

        @Schema(description = "La description de l'offre")
        @NotBlank
        String description,

        @Schema(description = "La liste des étiquettes de l'offre")
        @NotNull
        List<String> tags,

        @Schema(description = "Le salaire de l'offre")
        String salary,

        @Schema(description = "La date de création de l'offre")
        @NotNull  // Correction ici
        LocalDateTime creationDate,

        @Schema(description = "La date du début du stage")
        LocalDate internshipStartDate,

        @Schema(description = "La durée du stage")
        String internshipDuration,

        @Schema(description = "La date limite de candidature")
        LocalDate limitApplicationDate,

        @Schema(description = "Le niveau d'étude minimale nécessaire")
        String studyLevel,

        @Schema(description = "La politique de télétravail")
        String remoteWorkPolicy,

        @Schema(description = "L'identifiant de l'entreprise proposant l'offre")
        @NotBlank
        String companyId,

        @Schema(description = "Indique si l'offre est toujours ouverte pour les candidatures")
        @NotBlank
        boolean offerOpen
) {
        public static OfferDto fromEntity(OfferEntity offerEntity){
                return new OfferDto(
                        offerEntity.getId(),
                        offerEntity.getTitle(),
                        offerEntity.getDescription(),
                        offerEntity.getTags(),
                        offerEntity.getSalary(),
                        offerEntity.getCreationDate(),
                        offerEntity.getInternshipStartDate(),
                        offerEntity.getInternshipDuration(),
                        offerEntity.getLimitApplicationDate(),
                        offerEntity.getStudyLevel(),
                        offerEntity.getRemoteWorkPolicy(),
                        offerEntity.getCompany().getId(),
                        offerEntity.isOfferOpen()
                );
        }
}