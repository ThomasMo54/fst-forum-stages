package fr.fst.forumstages.backend.company;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.fst.forumstages.backend.company.dto.CreateCompanyDto;
import fr.fst.forumstages.backend.company.dto.UpdateCompanyDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

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
    public void createCompany_success() throws Exception {
        CreateCompanyDto createCompanyDto = new CreateCompanyDto(
            "Test Company",
            null,
            null,
            null,
            null,
            null
        );
        CompanyEntity createdCompany = new CompanyEntity();
        createdCompany.setId("123");
        createdCompany.setName("Test Company");

        when(companyService.createCompany(any(CreateCompanyDto.class))).thenReturn(createdCompany);

        mockMvc.perform(post("/companies")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(createCompanyDto)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value("123"))
            .andExpect(jsonPath("$.name").value("Test Company"));
    }

    @Test
    public void createCompany_validationError() throws Exception {
        CreateCompanyDto createCompanyDto = new CreateCompanyDto(
            "",
            null,
            null,
            null,
            null,
            null
        );

        mockMvc.perform(post("/companies")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(createCompanyDto)))
            .andExpect(status().isBadRequest());
    }

    @Test
    public void createCompany_missingName() throws Exception {
        CreateCompanyDto createCompanyDto = new CreateCompanyDto(
            null,
            null,
            null,
            null,
            null,
            null
        );

        mockMvc.perform(post("/companies")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(createCompanyDto)))
            .andExpect(status().isBadRequest());
    }

    @Test
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
    public void findCompanyById_notFound() throws Exception {
        String companyId = "nonexistent-id";

        when(companyService.findCompanyById(companyId)).thenThrow(new NoSuchElementException("Company with id " + companyId + " not found"));

        mockMvc.perform(get("/companies/{id}", companyId))
                .andExpect(status().isNotFound());
    }

    @Test
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
}
