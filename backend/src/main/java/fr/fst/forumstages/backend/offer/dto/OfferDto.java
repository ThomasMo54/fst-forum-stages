package fr.fst.forumstages.backend.offer.dto;

import fr.fst.forumstages.backend.offer.OfferEntity;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

public record OfferDto(
        @NotBlank
        String id,

        @NotBlank @Length(max = 200)
        String title,

        @NotBlank
        String description,

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
