package fr.fst.forumstages.backend.application.dto;

import fr.fst.forumstages.backend.application.ApplicationEntity;
import fr.fst.forumstages.backend.offer.dto.OfferDto;
import fr.fst.forumstages.backend.student.dto.StudentDto;
import jakarta.validation.constraints.NotBlank;

public record ApplicationDto(
        @NotBlank() String id,
        @NotBlank() String studentId, @NotBlank() String offerId, @NotBlank() boolean accepted, @NotBlank() boolean rejected) {
    public static ApplicationDto fromEntity(ApplicationEntity applicationEntity) {
        return new ApplicationDto(applicationEntity.getId(),
                StudentDto.fromEntity(applicationEntity.getStudent()).id(),
                OfferDto.fromEntity(applicationEntity.getOffer()).id(),
                applicationEntity.isAccepted(),
                applicationEntity.isRejected());
    }
};
