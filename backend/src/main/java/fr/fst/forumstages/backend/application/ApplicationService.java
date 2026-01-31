package fr.fst.forumstages.backend.application;

import java.util.List;
import java.util.NoSuchElementException;

import fr.fst.forumstages.backend.notification.NotificationService;
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
    private final NotificationService notificationService;

    public ApplicationService(ApplicationRepository applicationRepository,
                              OfferRepository offerRepository,
                              StudentRepository studentRepository, NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.offerRepository = offerRepository;
        this.studentRepository = studentRepository;
        this.notificationService = notificationService;
    }

    public ApplicationEntity createApplication(CreateApplicationDto createApplicationDto) {
        StudentEntity studentEntity = studentRepository.findById(createApplicationDto.studentId())
                .orElseThrow(() -> new NoSuchElementException("student with id " + createApplicationDto.studentId() + " not found"));

        OfferEntity offerEntity = offerRepository.findById(createApplicationDto.offerId())
                .orElseThrow(()  -> new NoSuchElementException("offer with id " + createApplicationDto.offerId() + " not found"));

        var applicationDto = new ApplicationDto(null, studentEntity.getId(), offerEntity.getId(), false, false);
        var applicationEntity = ApplicationEntity.fromDto(applicationDto);

        applicationEntity.setStudent(studentEntity);
        applicationEntity.setOffer(offerEntity);

        ApplicationEntity savedApplication = applicationRepository.save(applicationEntity);

        notificationService.notifyApplicationSubmitted(savedApplication);
        notificationService.notifyNewApplicationReceived(savedApplication);

        return savedApplication;
    }

    public List<ApplicationEntity> getApplicationsForOffer(String offerId) {
        return applicationRepository.findByOfferId(offerId);
    }

    public List<ApplicationEntity> getApplicationsForStudent(String studentId) {
        return applicationRepository.findByStudentId(studentId);
    }

    public ApplicationEntity acceptApplication(String applicationId) {
        ApplicationEntity application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NoSuchElementException("Application with id " + applicationId + " not found"));

        if (application.isRejected()) {
            throw new IllegalStateException("Cannot accept a rejected application");
        } else {
            application.setAccepted(true);
            ApplicationEntity savedApplication = applicationRepository.save(application);
            notificationService.notifyApplicationAccepted(savedApplication);
            return savedApplication;
        }
    }

    public ApplicationEntity rejectApplication(String applicationId) {
        ApplicationEntity application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NoSuchElementException("Application with id " + applicationId + " not found"));

        if (application.isAccepted()) {
            throw new IllegalStateException("Cannot reject an accepted application");
        } else {
            application.setRejected(true);
            ApplicationEntity savedApplication = applicationRepository.save(application);
            notificationService.notifyApplicationRejected(savedApplication);
            return savedApplication;
        }
    }

    public ApplicationEntity resetApplicationStatus(String applicationId) {
        ApplicationEntity application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NoSuchElementException("Application with id " + applicationId + " not found"));

        application.setAccepted(false);
        application.setRejected(false);

        return applicationRepository.save(application);
    }
}
