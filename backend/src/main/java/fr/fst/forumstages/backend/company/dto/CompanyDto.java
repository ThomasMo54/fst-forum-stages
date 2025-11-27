package fr.fst.forumstages.backend.company.dto;

import fr.fst.forumstages.backend.company.CompanyEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

@Schema(description = "Données de l'entreprise.")
public record CompanyDto(
    @Schema(description = "L'identifiant unique de l'entreprise")
    @NotBlank
    String id,

    @Schema(description = "Le nom de l'entreprise")
    @NotBlank @Length(max = 100)
    String name,

    @Schema(description = "L'email de contact de l'entreprise")
    @Email
    String contactEmail,

    @Schema(description = "L'adresse de l'entreprise")
    @Length(max = 200)
    String streetAddress,

    @Schema(description = "La ville où se situe l'entreprise")
    @Length(max = 100)
    String city,

    @Schema(description = "Le code postal de l'entreprise")
    @Length(max = 20)
    String postalCode,

    @Schema(description = "Le pays où se situe l'entreprise")
    @Length(max = 50)
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
