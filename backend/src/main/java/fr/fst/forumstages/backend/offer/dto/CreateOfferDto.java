package fr.fst.forumstages.backend.offer.dto;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

public record CreateOfferDto(
        @NotBlank(message = "Title must not be blank")
        @Length(max = 200, message = "Title must be shorter or equal to 100 characters")
        String title,

        @NotBlank(message = "Description must not be blank")
        String description,

        @NotBlank(message = "CompanyId must not be blank")
        String companyId
) {
}
