package fr.fst.forumstages.backend.company;

import fr.fst.forumstages.backend.company.dto.CompanyDto;
import lombok.AccessLevel;
import lombok.Data;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

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

    public static CompanyEntity fromDto(CompanyDto companyDto) {
        CompanyEntity companyEntity = new CompanyEntity();
        companyEntity.id = companyDto.id();
        companyEntity.name = companyDto.name();
        companyEntity.contactEmail = companyDto.contactEmail();
        companyEntity.streetAddress = companyDto.streetAddress();
        companyEntity.city = companyDto.city();
        companyEntity.postalCode = companyDto.postalCode();
        companyEntity.country = companyDto.country();
        return companyEntity;
    }
}
