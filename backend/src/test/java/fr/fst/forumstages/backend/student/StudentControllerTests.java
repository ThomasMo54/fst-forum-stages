package fr.fst.forumstages.backend.student;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.fst.forumstages.backend.student.dto.StudentDto;
import fr.fst.forumstages.backend.student.dto.StudentRequestDto;
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

        StudentRequestDto request = new StudentRequestDto(
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
                LocalDateTime.now(),
                "user-123"
        );

        when(studentService.updateStudent(any(String.class), any(StudentRequestDto.class)))
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

    @Test
    @WithMockUser
    void getStudentByUserId_Success() throws Exception {
        String userId = "user-123";
        List<String> skills = Arrays.asList("Python", "Machine Learning", "TensorFlow");

        StudentDto response = new StudentDto(
                "student-456",
                "Sophie",
                "Martin",
                "sophie.martin@example.com",
                "STU987654",
                "+33687654321",
                "Doctorat",
                "Intelligence Artificielle",
                "Deep Learning",
                3,
                skills,
                "/cv/sophie-martin.pdf",
                LocalDateTime.now(),
                userId
        );

        when(studentService.findByUserId(userId)).thenReturn(response);

        mockMvc.perform(get("/students/by-user/{userId}", userId)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("student-456"))
                .andExpect(jsonPath("$.firstName").value("Sophie"))
                .andExpect(jsonPath("$.lastName").value("Martin"))
                .andExpect(jsonPath("$.email").value("sophie.martin@example.com"))
                .andExpect(jsonPath("$.studentNumber").value("STU987654"))
                .andExpect(jsonPath("$.phone").value("+33687654321"))
                .andExpect(jsonPath("$.educationLevel").value("Doctorat"))
                .andExpect(jsonPath("$.fieldOfStudy").value("Intelligence Artificielle"))
                .andExpect(jsonPath("$.specialization").value("Deep Learning"))
                .andExpect(jsonPath("$.yearOfStudy").value(3))
                .andExpect(jsonPath("$.userId").value(userId))
                .andExpect(jsonPath("$.skills").isArray())
                .andExpect(jsonPath("$.skills[0]").value("Python"))
                .andExpect(jsonPath("$.skills[1]").value("Machine Learning"))
                .andExpect(jsonPath("$.skills[2]").value("TensorFlow"));
    }

    @Test
    @WithMockUser
    void getStudentByUserId_NotFound() throws Exception {
        String userId = "nonexistent-user";

        when(studentService.findByUserId(userId))
                .thenThrow(new NoSuchElementException("Student not found with User ID: " + userId));

        mockMvc.perform(get("/students/by-user/{userId}", userId)
                        .with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    void getStudentByUserId_Unauthorized() throws Exception {
        String userId = "user-123";

        mockMvc.perform(get("/students/by-user/{userId}", userId)
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }
}