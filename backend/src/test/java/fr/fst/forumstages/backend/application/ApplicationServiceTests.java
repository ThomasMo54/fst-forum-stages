package fr.fst.forumstages.backend.application;

import fr.fst.forumstages.backend.application.ApplicationEntity;
import fr.fst.forumstages.backend.application.ApplicationRepository;
import fr.fst.forumstages.backend.application.dto.CreateApplicationDto;
import fr.fst.forumstages.backend.offer.OfferEntity;
import fr.fst.forumstages.backend.offer.OfferRepository;
import fr.fst.forumstages.backend.student.StudentEntity;
import fr.fst.forumstages.backend.student.StudentRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ApplicationServiceTests {

    @InjectMocks
    private ApplicationService applicationService;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private OfferRepository offerRepository;

    @Mock
    private StudentRepository studentRepository;

    @Test
    public void testCreateApplication_success() {
        var createApplicationDto = new CreateApplicationDto(
                null,
                null);

        StudentEntity studentEntity = new StudentEntity();

        OfferEntity offerEntity = new OfferEntity();

        when(applicationRepository.save(any(ApplicationEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(studentRepository.findById(any())).thenReturn(Optional.of(studentEntity));
        when(offerRepository.findById(any())).thenReturn(Optional.of(offerEntity));
        ArgumentCaptor<ApplicationEntity> applicationCaptor = ArgumentCaptor.forClass(ApplicationEntity.class);

        ApplicationEntity result = applicationService.createApplication(createApplicationDto);

        verify(applicationRepository, times(1)).save(applicationCaptor.capture());

        ApplicationEntity createdApplication = applicationCaptor.getValue();

        assertEquals(createdApplication, result);
    }

    @Test
    public void testFindApplicationByOfferId_success() {
        String offerId = "123";
        OfferEntity mockOffer = new OfferEntity();
        mockOffer.setId(offerId);

        String applicationId = "456";
        var mockApplication = new ApplicationEntity();
        mockApplication.setId(applicationId);
        mockApplication.setOffer(mockOffer);

        when(applicationRepository.findByOfferId(offerId)).thenReturn(List.of(mockApplication));

        List<ApplicationEntity> result = applicationService.getApplicationsForOffer(offerId);

        assertEquals(mockApplication, result.getFirst());
    }

    @Test
    public void testFindApplicationByStudentId_success() {
        String studentId = "123";
        var mockStudent = new StudentEntity();
        mockStudent.setId(studentId);

        String applicationId = "456";
        var mockApplication = new ApplicationEntity();
        mockApplication.setId(applicationId);
        mockApplication.setStudent(mockStudent);

        when(applicationRepository.findByStudentId(studentId)).thenReturn(List.of(mockApplication));

        List<ApplicationEntity> result = applicationService.getApplicationsForStudent(studentId);

        assertEquals(mockApplication, result.getFirst());
    }
}
