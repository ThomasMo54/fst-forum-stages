package fr.fst.forumstages.backend.company;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "companies")
public record CompanyEntity(
    @Id
    String id,
    @NotBlank
    @Length(max = 100)
    String name,
    @Email
    String email,
    @Email
    String contactEmail,
    @NotBlank
    @Length(max = 200)
    String streetAddress,
    @NotBlank
    @Length(max = 100)
    String city,
    @NotBlank
    @Length(max = 20)
    String postalCode,
    @NotBlank
    @Length(max = 50)
    String country
) {}
