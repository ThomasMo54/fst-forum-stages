package fr.fst.forumstages.backend.offer.dto;
import fr.fst.forumstages.backend.offer.OfferEntity;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

public record OfferWithoutCompanyDto(
        @NotBlank
        String id,

        @NotBlank @Length(max = 200)
        String title,

        @NotBlank
        String description
) {
    public static OfferWithoutCompanyDto fromEntity(OfferEntity offerEntity){
        return new OfferWithoutCompanyDto(
                offerEntity.getId(),
                offerEntity.getTitle(),
                offerEntity.getDescription()
        );
    }
}
