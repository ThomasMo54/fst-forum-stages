package fr.fst.forumstages.backend.offer;

import fr.fst.forumstages.backend.company.CompanyEntity;
import fr.fst.forumstages.backend.company.CompanyRepository;
import fr.fst.forumstages.backend.offer.dto.CreateOfferDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OfferServiceTests {

    @InjectMocks
    private OfferService offerService;

    @Mock
    private OfferRepository offerRepository;

    @Mock
    private CompanyRepository companyRepository;

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
}
