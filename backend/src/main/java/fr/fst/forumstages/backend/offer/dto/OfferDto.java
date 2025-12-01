package fr.fst.forumstages.backend.offer.dto;

import fr.fst.forumstages.backend.offer.OfferEntity;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

import java.util.Date;
import java.util.List;

public record OfferDto(
        @NotBlank
        String id,

        @NotBlank @Length(max = 200)
        String title,

        @NotBlank
        String description,

        @NotBlank
        String address,

        List<String> tags,

        String salary,

        @NotBlank
        Date creationDate,

        Date internshipStartDate,

        Date internshipDuration,

        Date limitApplicationDate,

        String studyLevel,

        String remoteWorkPolicy,

        @NotBlank
        String companyId
) {
    public static OfferDto fromEntity(OfferEntity offerEntity){
        return new OfferDto(
                offerEntity.getId(),
                offerEntity.getTitle(),
                offerEntity.getDescription(),
                offerEntity.getAddress(),
                offerEntity.getTags(),
                offerEntity.getSalary(),
                offerEntity.getCreationDate(),
                offerEntity.getInternshipStartDate(),
                offerEntity.getInternshipDuration(),
                offerEntity.getLimitApplicationDate(),
                offerEntity.getStudyLevel(),
                offerEntity.getRemoteWorkPolicy(),
                offerEntity.getCompany().getId()
        );
    }
}
