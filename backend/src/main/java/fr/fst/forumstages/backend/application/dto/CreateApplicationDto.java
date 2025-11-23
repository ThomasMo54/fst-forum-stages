package fr.fst.forumstages.backend.application.dto;

import fr.fst.forumstages.backend.application.ApplicationEntity;
import jakarta.validation.constraints.NotBlank;

public record CreateApplicationDto(
        @NotBlank() String applicationId,
        @NotBlank() String studentId, @NotBlank() String offerId) {
    public static CreateApplicationDto fromEntity(ApplicationEntity applicationEntity) {
        return new CreateApplicationDto(applicationEntity.getId(),
                StudentDto.fromEntity(applicationEntity.getStudent()),
                OfferDto.fromEntity(applicationEntity.getOffer()));
    }
};
