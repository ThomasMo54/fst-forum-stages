package fr.fst.forumstages.backend.company.dto;

import fr.fst.forumstages.backend.company.CompanyEntity;
import fr.fst.forumstages.backend.offer.dto.OfferWithoutCompanyDto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

import java.util.LinkedList;
import java.util.List;

public record CompanyDto(
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
    String country,

    List<OfferWithoutCompanyDto> offers
) {

    public static CompanyDto fromEntity(CompanyEntity companyEntity) {
        return new CompanyDto(
            companyEntity.getId(),
            companyEntity.getName(),
            companyEntity.getContactEmail(),
            companyEntity.getStreetAddress(),
            companyEntity.getCity(),
            companyEntity.getPostalCode(),
            companyEntity.getCountry(),
            companyEntity.getPublishedOffers() != null ? companyEntity.getPublishedOffers().stream().map(OfferWithoutCompanyDto::fromEntity).toList() : new LinkedList<>()
        );
    }
}
