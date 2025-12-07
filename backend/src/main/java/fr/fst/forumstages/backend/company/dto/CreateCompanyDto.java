package fr.fst.forumstages.backend.company.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

@Schema(description = "Données pour la création d'une nouvelle entreprise.")
public record CreateCompanyDto(
    @Schema(description = "Le nom de l'entreprise")
    @NotBlank @Email(message = "Email must be a valid email address")
    String email,

    @Schema(description = "Le mot de passe de l'utilisateur associé à l'entreprise")
    @NotBlank @Length(min = 8, max = 200, message = "Password must be between 8 and 200 characters long")
    String password,

    @Schema(description = "Le nom de l'entreprise")
    @NotBlank(message = "Name must not be blank")
    @Length(max = 100, message = "Name must be shorter or equal to 100 characters")
    String name,

    @Schema(description = "L'email de contact de l'entreprise")
    @Email(message = "Contact email must be a valid email address")
    String contactEmail,

    @Schema(description = "L'adresse de l'entreprise")
    @Length(max = 200, message = "Street address must be shorter or equal to 200 characters")
    String streetAddress,

    @Schema(description = "La ville où se situe l'entreprise")
    @Length(max = 100, message = "City must be shorter or equal to 100 characters")
    String city,

    @Schema(description = "Le code postal de l'entreprise")
    @Length(max = 20, message = "Postal code must be shorter or equal to 20 characters")
    String postalCode,

    @Schema(description = "Le pays où se situe l'entreprise")
    @Length(max = 50, message = "Country must be shorter or equal to 50 characters")
    String country
) {}
