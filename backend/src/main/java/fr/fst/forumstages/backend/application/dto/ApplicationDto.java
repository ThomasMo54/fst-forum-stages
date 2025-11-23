package fr.fst.forumstages.backend.application.dto;

import fr.fst.forumstages.backend.application.ApplicationEntity;
import jakarta.validation.constraints.NotBlank;

public record ApplicationDto(
        @NotBlank() String id,
        @NotBlank() String studentId, @NotBlank() String offerId) {
    public static ApplicationDto fromEntity(ApplicationEntity applicationEntity) {
        return new ApplicationDto(applicationEntity.getId(),
                StudentDto.fromEntity(applicationEntity.getStudent()),
                OfferDto.fromEntity(applicationEntity.getOffer()));
    }
};
