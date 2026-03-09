package fr.fst.forumstages.backend.company;

import fr.fst.forumstages.backend.company.dto.UpdateCompanyDto;
import fr.fst.forumstages.backend.offer.OfferEntity;
import fr.fst.forumstages.backend.offer.OfferRepository;
import fr.fst.forumstages.backend.offer.OfferService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CompanyServiceTests {

    @InjectMocks
    private CompanyService companyService;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private OfferRepository offerRepository;

    @Mock
    private OfferService offerService;

    private String companyId;
    private CompanyEntity mockCompany;

    @BeforeEach
    void setUp() {
        companyId = "test-company-id";
        mockCompany = new CompanyEntity();
        mockCompany.setId(companyId);
        mockCompany.setName("Test Company");
        mockCompany.setContactEmail("contact@company.com");
    }

    @Test
    public void findCompanyById_success() {
        String companyId = "123";
        CompanyEntity mockCompany = new CompanyEntity();
        mockCompany.setId(companyId);
        mockCompany.setName("Test Company");

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(mockCompany));

        CompanyEntity result = companyService.findCompanyById(companyId);

        assertEquals(mockCompany, result);
    }

    @Test
    public void findCompanyById_notFound() {
        String companyId = "nonexistent-id";

        when(companyRepository.findById(companyId)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> companyService.findCompanyById(companyId));
    }

    @Test
    public void updateCompany_success() {
        String companyId = "123";
        CompanyEntity mockCompany = new CompanyEntity();
        mockCompany.setId(companyId);
        mockCompany.setName("Old Name");

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(mockCompany));
        when(companyRepository.save(any(CompanyEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var updateDto = new UpdateCompanyDto(
                "New Name",
                "a@b.fr",
                "1 Main St",
                "Cityville",
                "12345",
                "Countryland"
        );

        CompanyEntity result = companyService.updateCompany(companyId, updateDto);

        assertEquals("New Name", result.getName());
        assertEquals("a@b.fr", result.getContactEmail());
        assertEquals("1 Main St", result.getStreetAddress());
        assertEquals("Cityville", result.getCity());
        assertEquals("12345", result.getPostalCode());
        assertEquals("Countryland", result.getCountry());

        verify(companyRepository, times(1)).save(mockCompany);
    }

    @Test
    public void updateCompany_partialUpdate_success() {
        String companyId = "123";
        CompanyEntity mockCompany = new CompanyEntity();
        mockCompany.setId(companyId);
        mockCompany.setName("Old Name");
        mockCompany.setContactEmail("a@b.fr");
        mockCompany.setStreetAddress("1 Main St");
        mockCompany.setCity("Cityville");
        mockCompany.setPostalCode("12345");
        mockCompany.setCountry("Countryland");

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(mockCompany));
        when(companyRepository.save(any(CompanyEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var updateDto = new UpdateCompanyDto(
                null,
                null,
                null,
                null,
                null,
                null
        );

        CompanyEntity result = companyService.updateCompany(companyId, updateDto);

        assertEquals("Old Name", result.getName());
        assertEquals("a@b.fr", result.getContactEmail());
        assertEquals("1 Main St", result.getStreetAddress());
        assertEquals("Cityville", result.getCity());
        assertEquals("12345", result.getPostalCode());
        assertEquals("Countryland", result.getCountry());

        verify(companyRepository, times(1)).save(mockCompany);
    }

    @Test
    public void testGetCompanyOffers_success() {
        String companyId = "123";
        CompanyEntity mockCompany = new CompanyEntity();
        mockCompany.setId(companyId);
        mockCompany.setName("Test Company");

        String offerId = "1";
        OfferEntity offer = new OfferEntity();
        offer.setId(offerId);
        offer.setCompany(mockCompany);

        String offerId2 = "2";
        OfferEntity offer2 = new OfferEntity();
        offer2.setId(offerId2);
        offer2.setCompany(mockCompany);

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(mockCompany));
        when(offerRepository.findOfferEntitiesByCompany_Id(eq(companyId), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Arrays.asList(offer, offer2)));

        Page<OfferEntity> results = companyService.getCompanyOffers(companyId, 0, 15);

        assertEquals(2, results.getContent().size());
        verify(companyRepository, times(1)).findById(companyId);
        verify(offerRepository, times(1)).findOfferEntitiesByCompany_Id(eq(companyId), any(Pageable.class));
    }

    @Test
    @DisplayName("Should delete company and its offers successfully")
    void testDeleteCompany_Success() {
        // Arrange
        OfferEntity offer1 = new OfferEntity();
        offer1.setId("offer-1");
        OfferEntity offer2 = new OfferEntity();
        offer2.setId("offer-2");
        List<OfferEntity> offers = new ArrayList<>();
        offers.add(offer1);
        offers.add(offer2);

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(mockCompany));
        when(offerRepository.findOfferEntitiesByCompany_Id(companyId)).thenReturn(offers);

        // Act
        companyService.deleteCompany(companyId);

        // Assert
        verify(companyRepository, times(2)).findById(companyId);
        verify(offerRepository, times(1)).findOfferEntitiesByCompany_Id(companyId);
        verify(offerService, times(2)).deleteOfferById(anyString());
        verify(offerService, times(1)).deleteOfferById("offer-1");
        verify(offerService, times(1)).deleteOfferById("offer-2");
        verify(companyRepository, times(1)).delete(mockCompany);
    }

    @Test
    @DisplayName("Should delete company without offers successfully")
    void testDeleteCompany_NoOffers() {
        // Arrange
        when(companyRepository.findById(companyId)).thenReturn(Optional.of(mockCompany));
        when(offerRepository.findOfferEntitiesByCompany_Id(companyId)).thenReturn(new ArrayList<>());

        // Act
        companyService.deleteCompany(companyId);

        // Assert
        verify(companyRepository, times(2)).findById(companyId);
        verify(offerRepository, times(1)).findOfferEntitiesByCompany_Id(companyId);
        verify(offerService, never()).deleteOfferById(anyString());
        verify(companyRepository, times(1)).delete(mockCompany);
    }

    @Test
    @DisplayName("Should throw NoSuchElementException when company doesn't exist")
    void testDeleteCompany_CompanyNotFound() {
        // Arrange
        when(companyRepository.findById(companyId)).thenReturn(Optional.empty());

        // Act & Assert
        NoSuchElementException exception = assertThrows(
                NoSuchElementException.class,
                () -> companyService.deleteCompany(companyId)
        );
        assertTrue(exception.getMessage().contains("Company with id"));
        verify(companyRepository, times(1)).findById(companyId);
        verify(companyRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Should handle multiple offers deletion")
    void testDeleteCompany_MultipleOffers() {
        // Arrange
        List<OfferEntity> offers = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            OfferEntity offer = new OfferEntity();
            offer.setId("offer-" + i);
            offers.add(offer);
        }

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(mockCompany));
        when(offerRepository.findOfferEntitiesByCompany_Id(companyId)).thenReturn(offers);

        // Act
        companyService.deleteCompany(companyId);

        // Assert
        verify(offerService, times(5)).deleteOfferById(anyString());
        verify(companyRepository, times(1)).delete(mockCompany);
    }
}