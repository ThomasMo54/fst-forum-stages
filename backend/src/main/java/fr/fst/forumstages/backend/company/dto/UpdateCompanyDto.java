package fr.fst.forumstages.backend.company.dto;

import jakarta.validation.constraints.Email;
import org.hibernate.validator.constraints.Length;

public record UpdateCompanyDto(
    @Length(max = 100, message = "Name must be shorter or equal to 100 characters")
    String name,

    @Email(message = "Contact email must be a valid email address")
    String contactEmail,

    @Length(max = 200, message = "Street address must be shorter or equal to 200 characters")
    String streetAddress,

    @Length(max = 100, message = "City must be shorter or equal to 100 characters")
    String city,

    @Length(max = 20, message = "Postal code must be shorter or equal to 20 characters")
    String postalCode,

    @Length(max = 50, message = "Country must be shorter or equal to 50 characters")
    String country
) {}
