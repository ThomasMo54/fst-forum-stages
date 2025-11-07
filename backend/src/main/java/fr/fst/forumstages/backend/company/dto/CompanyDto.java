package fr.fst.forumstages.backend.company.dto;

import fr.fst.forumstages.backend.company.CompanyEntity;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

public record CompanyDto(
    @NotBlank()
    String id,
    @NotBlank @Length(max = 100)
    String name,
    @NotBlank @Email
    String contactEmail,
    @NotBlank @Length(max = 200)
    String streetAddress,
    @NotBlank @Length(max = 100)
    String city,
    @NotBlank @Length(max = 20)
    String postalCode,
    @NotBlank @Length(max = 50)
    String country
) {

    public static CompanyDto fromEntity(CompanyEntity companyEntity) {
        return new CompanyDto(
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
