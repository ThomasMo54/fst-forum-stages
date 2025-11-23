package fr.fst.forumstages.backend.application;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import fr.fst.forumstages.backend.application.dto.ApplicationDto;
import fr.fst.forumstages.backend.company.CompanyEntity;
import lombok.Data;

@Data
@Document(collection = "applications")
public class ApplicationEntity {
    @Id
    public String id;

    @DBRef
    private StudentEntity student;

    @DBRef
    private OfferEntity offer;

    public static ApplicationEntity fromDto(ApplicationDto applicationDto) {
        var applicationEntity = new ApplicationEntity();
        applicationEntity.id = applicationDto.id();

        return applicationEntity;
    }
}
