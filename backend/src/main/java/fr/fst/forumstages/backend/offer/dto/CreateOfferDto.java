package fr.fst.forumstages.backend.offer.dto;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

import java.util.Date;
import java.util.List;

public record CreateOfferDto(
        @NotBlank(message = "Title must not be blank")
        @Length(max = 200, message = "Title must be shorter or equal to 100 characters")
        String title,

        @NotBlank(message = "Description must not be blank")
        String description,

        @NotBlank(message = "Address must not be blank")
        String address,

        List<String> tags,

        String salary,

        Date internshipStartDate,

        Date internshipDuration,

        Date limitApplicationDate,

        String studyLevel,

        String remoteWorkPolicy,

        @NotBlank(message = "CompanyId must not be blank")
        String companyId
) {
}
