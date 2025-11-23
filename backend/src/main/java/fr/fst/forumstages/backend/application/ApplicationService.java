package fr.fst.forumstages.backend.application;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.data.domain.Example;
import org.springframework.stereotype.Service;

import fr.fst.forumstages.backend.application.dto.ApplicationDto;
import fr.fst.forumstages.backend.application.dto.CreateApplicationDto;

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
        var applicationDto = new ApplicationDto(null, null, null);

        var applicationEntity = ApplicationEntity.fromDto(applicationDto);

        var offerId = createApplicationDto.offerId();
        var offerEntity = offerRepository.findById(offerId)
                .orElseThrow(() -> new NoSuchElementException("Offer with id " + offerId + "not found"));
        applicationEntity.setOffer(offerEntity);

        var studentId = createApplicationDto.studentId();
        var studentEntity = studentRepository.findById(studentId)
                .orElseThrow(() -> new NoSuchElementException("Student with id " + studentId + "not found"));
        applicationEntity.setStudent(studentEntity);

        var finalApplication = applicationRepository.save(applicationEntity);

        return finalApplication;
    }

    public List<ApplicationEntity> getApplicationsForOffer(String offerId) {
        return applicationRepository.findByOfferId(offerId);
    }
}
