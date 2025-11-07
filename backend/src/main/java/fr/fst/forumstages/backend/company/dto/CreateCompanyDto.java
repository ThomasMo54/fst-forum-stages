package fr.fst.forumstages.backend.company.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

public record CreateCompanyDto(
    @NotBlank(message = "Name must not be blank")
    @Length(max = 100, message = "Name must be shorter or equal to 100 characters")
    String name,

    @NotBlank(message = "Contact email must not be blank")
    @Email(message = "Contact email must be a valid email address")
    String contactEmail,

    @NotBlank(message = "Street address must not be) blank")
    @Length(max = 200, message = "Street address must be shorter or equal to 200 characters")
    String streetAddress,

    @NotBlank(message = "City must not be blank")
    @Length(max = 100, message = "City must be shorter or equal to 100 characters")
    String city,

    @NotBlank(message = "Postal code must not be blank")
    @Length(max = 20, message = "Postal code must be shorter or equal to 20 characters")
    String postalCode,

    @NotBlank(message = "Country must not be blank")
    @Length(max = 50, message = "Country must be shorter or equal to 50 characters")
    String country
) {}
