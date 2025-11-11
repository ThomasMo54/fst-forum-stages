package fr.fst.forumstages.backend.company.dto;

import fr.fst.forumstages.backend.company.CompanyEntity;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

public record CompanyWithoutOffersDto (
        @NotBlank()
        String id,

        @NotBlank @Length(max = 100)
        String name,

        @Email
        String contactEmail,

        @Length(max = 200)
        String streetAddress,

        @Length(max = 100)
        String city,

        @Length(max = 20)
        String postalCode,

        @Length(max = 50)
        String country
){
    public static CompanyWithoutOffersDto fromEntity(CompanyEntity companyEntity) {
        return new CompanyWithoutOffersDto(
                companyEntity.getId(),
                companyEntity.getName(),
                companyEntity.getContactEmail(),
                companyEntity.getStreetAddress(),
                companyEntity.getCity(),
                companyEntity.getPostalCode(),
                companyEntity.getCountry()
        );
    }
}
