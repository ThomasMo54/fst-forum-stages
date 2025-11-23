package fr.fst.forumstages.backend.student;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.fst.forumstages.backend.student.dto.StudentDto;
import fr.fst.forumstages.backend.student.dto.StudentRequestDto;
import fr.fst.forumstages.backend.student.enums.AccountStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StudentController.class)
class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private StudentService studentService;

    @Test
    @WithMockUser
    void addStudent_Success() throws Exception {
        StudentRequestDto request = new StudentRequestDto(
                "Jean", "Dupont", "jean.dupont@example.com", "STU123456",
                "+33612345678", "Master", "Informatique", "Dev Web", 2,
                Arrays.asList("Java", "Spring")
        );

        StudentDto response = new StudentDto(
                "123", "Jean", "Dupont", "jean.dupont@example.com", "STU123456",
                "+33612345678", "Master", "Informatique", "Dev Web", 2,
                Arrays.asList("Java", "Spring"), null, AccountStatus.PENDING,
                LocalDateTime.now(), null
        );

        when(studentService.addStudent(any(StudentRequestDto.class))).thenReturn(response);

        mockMvc.perform(post("/students")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("jean.dupont@example.com"));
    }

    @Test
    @WithMockUser
    void updateStudent_Success() throws Exception {
        StudentRequestDto request = new StudentRequestDto(
                "Jean", "Dupont", "jean.dupont@example.com", "STU123456",
                "+33612345678", "Master", "Informatique", "Dev Web", 2, null
        );

        StudentDto response = new StudentDto(
                "123", "Jean", "Dupont", "jean.dupont@example.com", "STU123456",
                "+33612345678", "Master", "Informatique", "Dev Web", 2, null,
                null, AccountStatus.PENDING, LocalDateTime.now(), null
        );

        when(studentService.updateStudent(any(String.class), any(StudentRequestDto.class)))
                .thenReturn(response);

        mockMvc.perform(put("/students/123")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("123"));
    }
}