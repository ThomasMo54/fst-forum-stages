package fr.fst.forumstages.backend.application;

import com.fasterxml.jackson.databind.ObjectMapper;

import fr.fst.forumstages.backend.application.dto.CreateApplicationDto;
import fr.fst.forumstages.backend.company.CompanyEntity;
import fr.fst.forumstages.backend.storage.FileStorageService;
import fr.fst.forumstages.backend.student.StudentEntity;
import fr.fst.forumstages.backend.student.StudentService;
import fr.fst.forumstages.backend.offer.OfferEntity;
import fr.fst.forumstages.backend.offer.OfferService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ApplicationController.class)
public class ApplicationControllerTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ApplicationService applicationService;

    @MockitoBean
    private OfferService offerService;

    @MockitoBean
    private StudentService studentService;

    @MockitoBean
    private FileStorageService fileStorageService;

    @Test
    @WithMockUser(roles = "USER")
    public void createApplication_success() throws Exception {
        var studentEntity = new StudentEntity();
        studentEntity.setId("456");

        var companyEntity = new CompanyEntity();
        companyEntity.setId("101");

        var offerEntity = new OfferEntity();
        offerEntity.setId("789");
        offerEntity.setCompany(companyEntity);

        var createApplicationDto = new CreateApplicationDto(
                studentEntity.getId(), offerEntity.getId());

        var createdApplication = new ApplicationEntity();
        createdApplication.setId("123");
        createdApplication.setOffer(offerEntity);
        createdApplication.setStudent(studentEntity);

        when(applicationService.createApplication(any(CreateApplicationDto.class))).thenReturn(createdApplication);

        mockMvc.perform(post("/applications")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createApplicationDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("123"))
                .andExpect(jsonPath("$.studentId").value("456"))
                .andExpect(jsonPath("$.offerId").value("789"));
    }

    @Test
    @WithMockUser(roles = "USER")
    public void findApplicationForOffer_success() throws Exception {
        String companyId = "101";
        var mockCompany = new CompanyEntity();
        mockCompany.setId(companyId);

        String offerId = "456";
        var mockOffer = new OfferEntity();
        mockOffer.setId(offerId);
        mockOffer.setCompany(mockCompany);

        String studentId = "789";
        var mockStudent = new StudentEntity();
        mockStudent.setId(studentId);

        String applicationId = "123";
        var mockApplication = new ApplicationEntity();
        mockApplication.setId(applicationId);
        mockApplication.setOffer(mockOffer);
        mockApplication.setStudent(mockStudent);

        when(applicationService.getApplicationsForOffer(offerId)).thenReturn(List.of(mockApplication));
        when(offerService.findOfferById(offerId)).thenReturn(mockOffer);

        mockMvc.perform(get("/applications/offer/{id}", offerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(applicationId));
    }

    @Test
    @WithMockUser(roles = "USER")
    public void findApplicationForStudent_success() throws Exception {
        String companyId = "101";
        var mockCompany = new CompanyEntity();
        mockCompany.setId(companyId);

        String offerId = "456";
        var mockOffer = new OfferEntity();
        mockOffer.setId(offerId);
        mockOffer.setCompany(mockCompany);

        String studentId = "456";
        var mockStudent = new StudentEntity();
        mockStudent.setId(studentId);

        String applicationId = "123";
        var mockApplication = new ApplicationEntity();
        mockApplication.setId(applicationId);
        mockApplication.setStudent(mockStudent);
        mockApplication.setOffer(mockOffer);

        when(applicationService.getApplicationsForStudent(studentId)).thenReturn(List.of(mockApplication));

        mockMvc.perform(get("/applications/student/{id}", studentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(applicationId));
    }
}
