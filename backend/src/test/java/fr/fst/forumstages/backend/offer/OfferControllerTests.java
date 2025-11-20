package fr.fst.forumstages.backend.offer;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.fst.forumstages.backend.company.CompanyEntity;
import fr.fst.forumstages.backend.offer.dto.CreateOfferDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OfferController.class)
public class OfferControllerTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private OfferService offerService;

    @Test
    @WithMockUser
    public void createOffer_success() throws Exception {
        CreateOfferDto createOfferDto = new CreateOfferDto(
                "Test Title",
                "Test Description",
                "123"
        );

        CompanyEntity companyEntity = new CompanyEntity();
        companyEntity.setId("123");

        OfferEntity createdOffer = new OfferEntity();
        createdOffer.setId("456");
        createdOffer.setTitle("Test Title");
        createdOffer.setDescription("Test Description");
        createdOffer.setCompany(companyEntity);

        when(offerService.createOffer(any(CreateOfferDto.class))).thenReturn(createdOffer);

        mockMvc.perform(post("/offers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createOfferDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("456"))
                .andExpect(jsonPath("$.title").value("Test Title"))
                .andExpect(jsonPath("$.description").value("Test Description"))
                .andExpect(jsonPath("$.companyId").value("123"));
    }

    @Test
    @WithMockUser
    public void createOffer_validationError() throws Exception {
        CreateOfferDto createOfferDto = new CreateOfferDto(
                "",
                "",
                null
        );

        mockMvc.perform(post("/offers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createOfferDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void createOffer_missingTitle() throws Exception {
        CreateOfferDto createOfferDto = new CreateOfferDto(
                null,
                "",
                null
        );

        mockMvc.perform(post("/offers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createOfferDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void createOffer_missingDescription() throws Exception {
        CreateOfferDto createOfferDto = new CreateOfferDto(
                "",
                null,
                null
        );

        mockMvc.perform(post("/offers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createOfferDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void findOfferById_success() throws Exception {
        String offerId = "123";

        CompanyEntity companyEntity = new CompanyEntity();
        companyEntity.setId("456");

        OfferEntity mockOffer = new OfferEntity();
        mockOffer.setId(offerId);
        mockOffer.setTitle("Test Title");
        mockOffer.setDescription("Test Description");
        mockOffer.setCompany(companyEntity);

        when(offerService.findOfferById(offerId)).thenReturn(mockOffer);

        mockMvc.perform(get("/offers/{offerId}",offerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(offerId))
                .andExpect(jsonPath("$.title").value("Test Title"))
                .andExpect(jsonPath("$.description").value("Test Description"));
    }

    @Test
    @WithMockUser
    public void findOfferById_notFound() throws Exception {
        String offerId = "nonexistent-id";

        when(offerService.findOfferById(offerId)).thenThrow(new NoSuchElementException("Offer with id " + offerId + " not found"));

        mockMvc.perform(get("/offers/{offerId}",offerId))
                .andExpect(status().isNotFound());
    }

}
