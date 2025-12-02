package fr.fst.forumstages.backend.offer.dto;

import fr.fst.forumstages.backend.offer.OfferEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

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

        @Schema(description = "L'identifiant de l'entreprise proposant l'offre")
        @NotBlank
        String companyId
) {
    public static OfferDto fromEntity(OfferEntity offerEntity){
        return new OfferDto(
                offerEntity.getId(),
                offerEntity.getTitle(),
                offerEntity.getDescription(),
                offerEntity.getCompany().getId()
        );
    }
}
