package fr.fst.forumstages.backend.company;

import fr.fst.forumstages.backend.company.dto.UpdateCompanyDto;
import fr.fst.forumstages.backend.offer.OfferEntity;
import fr.fst.forumstages.backend.offer.OfferRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
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
        mockCompany.setContactEmail("a@b.fr");

        when(companyRepository.findById(companyId)).thenReturn(Optional.of(mockCompany));
        when(companyRepository.save(any(CompanyEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var updateDto = new UpdateCompanyDto(
                "New Name",
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
}