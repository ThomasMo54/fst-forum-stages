package fr.fst.forumstages.backend.company;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.fst.forumstages.backend.company.dto.UpdateCompanyDto;
import fr.fst.forumstages.backend.offer.OfferEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;
import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CompanyController.class)
public class CompanyControllerTests {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CompanyService companyService;

    @Test
    @WithMockUser(roles = "ADMIN")
    public void findCompanyById_success() throws Exception {
        String companyId = "123";
        CompanyEntity mockCompany = new CompanyEntity();
        mockCompany.setId(companyId);
        mockCompany.setName("Test Company");

        when(companyService.findCompanyById(companyId)).thenReturn(mockCompany);

        mockMvc.perform(get("/companies/{id}", companyId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(companyId))
            .andExpect(jsonPath("$.name").value("Test Company"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void findCompanyById_notFound() throws Exception {
        String companyId = "nonexistent-id";

        when(companyService.findCompanyById(companyId)).thenThrow(new NoSuchElementException("Company with id " + companyId + " not found"));

        mockMvc.perform(get("/companies/{id}", companyId))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void updateCompany_success() throws Exception {
        String companyId = "123";
        UpdateCompanyDto updateCompanyDto = new UpdateCompanyDto(
            "Updated Company",
            null,
            null,
            null,
            null,
            null
        );
        CompanyEntity updatedCompany = new CompanyEntity();
        updatedCompany.setId(companyId);
        updatedCompany.setName("Updated Company");

        when(companyService.updateCompany(any(String.class), any(UpdateCompanyDto.class))).thenReturn(updatedCompany);

        mockMvc.perform(put("/companies/{id}", companyId)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(updateCompanyDto)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(companyId))
            .andExpect(jsonPath("$.name").value("Updated Company"));
    }

    @Test
    public void deleteCompany_success() throws Exception {
        String companyId = "123";

        mockMvc.perform(delete("/companies/{id}", companyId))
                .andExpect(status().isOk());
    }

    @Test
    public void getAllOffers_success() throws Exception {
        String companyId = "123";

        OfferEntity offer1 = new OfferEntity();
        offer1.setId("id1");
        offer1.setTitle("Title 1");
        offer1.setDescription("Description 1");

        OfferEntity offer2 = new OfferEntity();
        offer2.setId("id2");
        offer2.setTitle("Title 2");
        offer2.setDescription("Description 2");

        CompanyEntity companyEntity = new CompanyEntity();
        companyEntity.setId(companyId);

        offer1.setCompany(companyEntity);
        offer2.setCompany(companyEntity);

        when(companyService.getCompanyOffers(companyId)).thenReturn(Arrays.asList(offer1, offer2));

        mockMvc.perform(get("/companies/{id}/offers", companyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value("id1"))
                .andExpect(jsonPath("$[0].title").value("Title 1"))
                .andExpect(jsonPath("$[0].description").value("Description 1"))
                .andExpect(jsonPath("$[1].id").value("id2"))
                .andExpect(jsonPath("$[1].title").value("Title 2"))
                .andExpect(jsonPath("$[1].description").value("Description 2"));
    }

    @Test
    public void getAllOffers_notFound() throws Exception {
        String companyId = "nonexistent-id";

        when(companyService.getCompanyOffers(companyId)).thenThrow(new NoSuchElementException("Company with id " + companyId + " not found"));

        mockMvc.perform(get("/companies/{id}/offers", companyId))
                .andExpect(status().isNotFound());
    }

    @Test
    public void getAllOffers_empty() throws Exception {
        String companyId = "123";

        when(companyService.getCompanyOffers(companyId)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/companies/{id}/offers", companyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
