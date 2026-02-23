package fr.fst.forumstages.backend.company;

import fr.fst.forumstages.backend.company.dto.CompanyDto;
import fr.fst.forumstages.backend.offer.OfferEntity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.LinkedList;
import java.util.List;

@Data
@Document(collection = "companies")
public class CompanyEntity {

    @Id
    private String id;

    private String name;

    private String contactEmail;

    private String streetAddress;

    private String city;

    private String postalCode;

    private String country;

    @DBRef
    private List<OfferEntity> publishedOffers = new LinkedList<>();

    public static CompanyEntity fromDto(CompanyDto companyDto) {
        CompanyEntity companyEntity = new CompanyEntity();
        companyEntity.id = companyDto.id();
        companyEntity.name = companyDto.name();
        companyEntity.streetAddress = companyDto.streetAddress();
        companyEntity.city = companyDto.city();
        companyEntity.postalCode = companyDto.postalCode();
        companyEntity.country = companyDto.country();

        return companyEntity;
    }
}
