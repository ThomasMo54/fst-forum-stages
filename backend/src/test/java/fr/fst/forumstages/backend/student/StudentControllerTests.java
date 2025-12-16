package fr.fst.forumstages.backend.student;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.fst.forumstages.backend.student.dto.StudentDto;
import fr.fst.forumstages.backend.student.dto.UpdateStudentDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StudentController.class)
class StudentControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private StudentService studentService;

    @Test
    @WithMockUser
    void updateStudent_Success() throws Exception {
        List<String> skills = Arrays.asList("Java", "Spring Boot");

        UpdateStudentDto request = new UpdateStudentDto(
                "Jean",
                "Dupont",
                "jean.dupont@example.com",
                "STU123456",
                "+33612345678",
                "Master",
                "Informatique",
                "Dev Web",
                2,
                skills
        );

        StudentDto response = new StudentDto(
                "123",
                "Jean",
                "Dupont",
                "jean.dupont@example.com",
                "STU123456",
                "+33612345678",
                "Master",
                "Informatique",
                "Dev Web",
                2,
                skills,
                null,
                LocalDateTime.now()
        );

        when(studentService.updateStudent(any(String.class), any(UpdateStudentDto.class)))
                .thenReturn(response);

        mockMvc.perform(put("/students/123")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("123"))
                .andExpect(jsonPath("$.firstName").value("Jean"))
                .andExpect(jsonPath("$.lastName").value("Dupont"))
                .andExpect(jsonPath("$.email").value("jean.dupont@example.com"))
                .andExpect(jsonPath("$.studentNumber").value("STU123456"))
                .andExpect(jsonPath("$.educationLevel").value("Master"))
                .andExpect(jsonPath("$.fieldOfStudy").value("Informatique"))
                .andExpect(jsonPath("$.specialization").value("Dev Web"))
                .andExpect(jsonPath("$.yearOfStudy").value(2));
    }
}