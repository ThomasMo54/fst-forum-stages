package fr.fst.forumstages.backend.offer;

import fr.fst.forumstages.backend.company.CompanyEntity;
import fr.fst.forumstages.backend.offer.dto.OfferDto;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "offers")
public class OfferEntity {
    @Id
    private String id;

    private String title;

    private String description;

    @DBRef
    private CompanyEntity company;

    public static OfferEntity fromDto(OfferDto offerDto) {
        OfferEntity offerEntity = new OfferEntity();
        offerEntity.id = offerDto.id();
        offerEntity.title = offerDto.title();
        offerEntity.description = offerDto.description();

        return offerEntity;
    }
}
