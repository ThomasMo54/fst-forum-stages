package fr.fst.forumstages.backend.student;

import fr.fst.forumstages.backend.student.dto.StudentDto;
import fr.fst.forumstages.backend.student.dto.UpdateStudentDto;
import fr.fst.forumstages.backend.user.UserEntity;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceTests {

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentService studentService;

    @Test
    void updateStudent_Success() {
        UpdateStudentDto request = new UpdateStudentDto(
                "Jean", "Martin", "jean.martin@example.com", "STU123456",
                "+33612345678", "Master", "Informatique", "Dev Web", 3, null
        );

        StudentEntity entity = new StudentEntity();
        entity.setId("123");
        entity.setFirstName("Jean");
        entity.setLastName("Dupont");
        entity.setEmail("jean.dupont@example.com");
        entity.setStudentNumber("STU123456");

        when(studentRepository.findById("123")).thenReturn(Optional.of(entity));
        when(studentRepository.existsByEmail("jean.martin@example.com")).thenReturn(false);
        when(studentRepository.save(any(StudentEntity.class))).thenReturn(entity);

        StudentDto result = studentService.updateStudent("123", request);

        assertThat(result).isNotNull();
        verify(studentRepository, times(1)).save(any(StudentEntity.class));
    }

    @Test
    void findByUserId_Success() {
        String userId = "user-123";
        UserEntity mockUser = new UserEntity();
        mockUser.setId(userId);
        mockUser.setEmail("marie.dupont@example.com");
        List<String> skills = Arrays.asList("Java", "Spring Boot", "MongoDB");

        StudentEntity studentEntity = new StudentEntity();
        studentEntity.setId("student-456");
        studentEntity.setFirstName("Marie");
        studentEntity.setLastName("Dupont");
        studentEntity.setEmail("marie.dupont@example.com");
        studentEntity.setStudentNumber("STU789012");
        studentEntity.setPhone("+33698765432");
        studentEntity.setEducationLevel("Master");
        studentEntity.setFieldOfStudy("Informatique");
        studentEntity.setSpecialization("Data Science");
        studentEntity.setYearOfStudy(2);
        studentEntity.setSkills(skills);
        studentEntity.setRegistrationDate(LocalDateTime.now());
        studentEntity.setUser(mockUser);

        when(studentRepository.findByUserId(userId)).thenReturn(Optional.of(studentEntity));

        StudentDto result = studentService.findByUserId(userId);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo("student-456");
        assertThat(result.firstName()).isEqualTo("Marie");
        assertThat(result.lastName()).isEqualTo("Dupont");
        assertThat(result.email()).isEqualTo("marie.dupont@example.com");
        assertThat(result.studentNumber()).isEqualTo("STU789012");
        assertThat(result.userId()).isEqualTo(userId);
        assertThat(result.skills()).isEqualTo(skills);

        verify(studentRepository, times(1)).findByUserId(userId);
    }

    @Test
    void findByUserId_NotFound() {
        String userId = "nonexistent-user-id";

        when(studentRepository.findByUserId(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentService.findByUserId(userId))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Student not found with User ID: " + userId);

        verify(studentRepository, times(1)).findByUserId(userId);
    }
}