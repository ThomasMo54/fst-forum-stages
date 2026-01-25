package fr.fst.forumstages.backend.application;

import java.util.List;
import java.util.NoSuchElementException;

import fr.fst.forumstages.backend.offer.OfferEntity;
import fr.fst.forumstages.backend.student.StudentEntity;
import org.springframework.stereotype.Service;

import fr.fst.forumstages.backend.application.dto.ApplicationDto;
import fr.fst.forumstages.backend.application.dto.CreateApplicationDto;
import fr.fst.forumstages.backend.offer.OfferRepository;
import fr.fst.forumstages.backend.student.StudentRepository;

@Service
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final OfferRepository offerRepository;
    private final StudentRepository studentRepository;

    public ApplicationService(ApplicationRepository applicationRepository,
            OfferRepository offerRepository,
            StudentRepository studentRepository) {
        this.applicationRepository = applicationRepository;
        this.offerRepository = offerRepository;
        this.studentRepository = studentRepository;
    }

    public ApplicationEntity createApplication(CreateApplicationDto createApplicationDto) {
        StudentEntity studentEntity = studentRepository.findById(createApplicationDto.studentId())
                .orElseThrow(() -> new NoSuchElementException("student with id " + createApplicationDto.studentId() + " not found"));

        OfferEntity offerEntity = offerRepository.findById(createApplicationDto.offerId())
                .orElseThrow(()  -> new NoSuchElementException("offer with id " + createApplicationDto.offerId() + " not found"));

        var applicationDto = new ApplicationDto(null, studentEntity.getId(), offerEntity.getId());
        var applicationEntity = ApplicationEntity.fromDto(applicationDto);

        applicationEntity.setStudent(studentEntity);
        applicationEntity.setOffer(offerEntity);


        return applicationRepository.save(applicationEntity);
    }

    public List<ApplicationEntity> getApplicationsForOffer(String offerId) {
        return applicationRepository.findByOfferId(offerId);
    }

    public List<ApplicationEntity> getApplicationsForStudent(String studentId) {
        return applicationRepository.findByStudentId(studentId);
    }

    public ApplicationEntity deleteApplication(String applicationId) {
        ApplicationEntity applicationEntity = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NoSuchElementException("application with id " + applicationId + " not found"));

        applicationRepository.delete(applicationEntity);
        return applicationEntity;
    }
}
