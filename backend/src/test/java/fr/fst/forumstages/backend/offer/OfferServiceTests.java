package fr.fst.forumstages.backend.offer;

import fr.fst.forumstages.backend.application.ApplicationEntity;
import fr.fst.forumstages.backend.application.ApplicationService;
import fr.fst.forumstages.backend.company.CompanyEntity;
import fr.fst.forumstages.backend.company.CompanyRepository;
import fr.fst.forumstages.backend.offer.dto.CreateOfferDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OfferServiceTests {

    @InjectMocks
    private OfferService offerService;

    @Mock
    private OfferRepository offerRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private ApplicationService applicationService;

    private String offerId;
    private OfferEntity mockOffer;

    @BeforeEach
    void setUp() {
        offerId = "test-offer-id";
        mockOffer = new OfferEntity();
        mockOffer.setId(offerId);
        mockOffer.setTitle("Test Offer");
        mockOffer.setOfferOpen(true);
    }

    @Test
    public void testCreateOffer_success() {
        CreateOfferDto createOfferDto = new CreateOfferDto(
                "Test Offer",
                "Test Description",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );

        CompanyEntity companyEntity = new CompanyEntity();

        when(offerRepository.save(any(OfferEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(companyRepository.findById(any())).thenReturn(Optional.of(companyEntity));
        ArgumentCaptor<OfferEntity> offerCaptor = ArgumentCaptor.forClass(OfferEntity.class);

        OfferEntity result = offerService.createOffer(createOfferDto);

        verify(offerRepository,times(1)).save(offerCaptor.capture());

        OfferEntity createdOffer = offerCaptor.getValue();

        assertNull(createdOffer.getId());
        assertEquals("Test Offer",createdOffer.getTitle());
        assertEquals("Test Description",createdOffer.getDescription());

        assertEquals(createdOffer,result);
    }

    @Test
    public void testFindOfferById_success() {
        String offerId = "123";
        OfferEntity mockOffer = new OfferEntity();
        mockOffer.setId(offerId);
        mockOffer.setTitle("Test Offer");
        mockOffer.setDescription("Test Description");

        when(offerRepository.findById(offerId)).thenReturn(Optional.of(mockOffer));

        OfferEntity result = offerService.findOfferById(offerId);

        verify(offerRepository,times(1)).findById(offerId);
        assertEquals(mockOffer,result);
    }

    @Test
    public void testFindOfferById_failure() {
        String offerId = "nonexistent-id";

        when(offerRepository.findById(offerId)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> offerService.findOfferById(offerId));
    }

    @Test
    @DisplayName("Should delete offer and its applications successfully")
    void testDeleteOfferById_Success() {
        // Arrange
        ApplicationEntity app1 = new ApplicationEntity();
        app1.setId("app-1");
        ApplicationEntity app2 = new ApplicationEntity();
        app2.setId("app-2");
        List<ApplicationEntity> applications = new ArrayList<>();
        applications.add(app1);
        applications.add(app2);

        when(offerRepository.existsById(offerId)).thenReturn(true);
        when(applicationService.getApplicationsForOffer(offerId)).thenReturn(applications);

        // Act
        offerService.deleteOfferById(offerId);

        // Assert
        verify(offerRepository, times(1)).existsById(offerId);
        verify(applicationService, times(1)).getApplicationsForOffer(offerId);
        verify(applicationService, times(2)).deleteApplication(anyString());
        verify(applicationService, times(1)).deleteApplication("app-1");
        verify(applicationService, times(1)).deleteApplication("app-2");
        verify(offerRepository, times(1)).deleteById(offerId);
    }

    @Test
    @DisplayName("Should delete offer without applications successfully")
    void testDeleteOfferById_NoApplications() {
        // Arrange
        when(offerRepository.existsById(offerId)).thenReturn(true);
        when(applicationService.getApplicationsForOffer(offerId)).thenReturn(new ArrayList<>());

        // Act
        offerService.deleteOfferById(offerId);

        // Assert
        verify(offerRepository, times(1)).existsById(offerId);
        verify(applicationService, times(1)).getApplicationsForOffer(offerId);
        verify(applicationService, never()).deleteApplication(anyString());
        verify(offerRepository, times(1)).deleteById(offerId);
    }

    @Test
    @DisplayName("Should throw NoSuchElementException when offer doesn't exist")
    void testDeleteOfferById_OfferNotFound() {
        // Arrange
        when(offerRepository.existsById(offerId)).thenReturn(false);

        // Act & Assert
        NoSuchElementException exception = assertThrows(
                NoSuchElementException.class,
                () -> offerService.deleteOfferById(offerId)
        );
        assertTrue(exception.getMessage().contains("Offer with id"));
        verify(offerRepository, times(1)).existsById(offerId);
        verify(offerRepository, never()).deleteById(anyString());
    }

    @Test
    @DisplayName("Should handle multiple applications deletion")
    void testDeleteOfferById_MultipleApplications() {
        // Arrange
        List<ApplicationEntity> applications = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            ApplicationEntity app = new ApplicationEntity();
            app.setId("app-" + i);
            applications.add(app);
        }

        when(offerRepository.existsById(offerId)).thenReturn(true);
        when(applicationService.getApplicationsForOffer(offerId)).thenReturn(applications);

        // Act
        offerService.deleteOfferById(offerId);

        // Assert
        verify(applicationService, times(5)).deleteApplication(anyString());
        verify(offerRepository, times(1)).deleteById(offerId);
    }

    @Test
    @DisplayName("Should delete open offer successfully")
    void testDeleteOfferById_OpenOffer() {
        // Arrange
        when(offerRepository.existsById(offerId)).thenReturn(true);
        when(applicationService.getApplicationsForOffer(offerId)).thenReturn(new ArrayList<>());

        // Act
        offerService.deleteOfferById(offerId);

        // Assert
        verify(offerRepository, times(1)).deleteById(offerId);
    }

    @Test
    @DisplayName("Should delete closed offer successfully")
    void testDeleteOfferById_ClosedOffer() {
        // Arrange
        when(offerRepository.existsById(offerId)).thenReturn(true);
        when(applicationService.getApplicationsForOffer(offerId)).thenReturn(new ArrayList<>());

        // Act
        offerService.deleteOfferById(offerId);

        // Assert
        verify(offerRepository, times(1)).deleteById(offerId);
    }

    @Test
    @DisplayName("Should delete all applications before deleting offer")
    void testDeleteOfferById_DeletesApplicationsBeforeOffer() {
        // Arrange
        ApplicationEntity app = new ApplicationEntity();
        app.setId("app-1");
        List<ApplicationEntity> applications = new ArrayList<>();
        applications.add(app);

        when(offerRepository.existsById(offerId)).thenReturn(true);
        when(applicationService.getApplicationsForOffer(offerId)).thenReturn(applications);

        // Act
        offerService.deleteOfferById(offerId);

        // Assert
        verify(applicationService, times(1)).deleteApplication("app-1");
        verify(offerRepository, times(1)).deleteById(offerId);
    }
}
