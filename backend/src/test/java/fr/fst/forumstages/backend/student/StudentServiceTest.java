package fr.fst.forumstages.backend.student;

import fr.fst.forumstages.backend.student.dto.StudentDto;
import fr.fst.forumstages.backend.student.dto.StudentRequestDto;
import fr.fst.forumstages.backend.student.enums.AccountStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentService studentService;

    @Test
    void addStudent_Success() {
        StudentRequestDto request = new StudentRequestDto(
                "Jean", "Dupont", "jean.dupont@example.com", "STU123456",
                "+33612345678", "Master", "Informatique", "Dev Web", 2,
                Arrays.asList("Java", "Spring")
        );

        StudentEntity entity = new StudentEntity();
        entity.setId("123");
        entity.setFirstName("Jean");
        entity.setLastName("Dupont");
        entity.setEmail("jean.dupont@example.com");
        entity.setStatus(AccountStatus.PENDING);

        when(studentRepository.existsByEmail(anyString())).thenReturn(false);
        when(studentRepository.existsByStudentNumber(anyString())).thenReturn(false);
        when(studentRepository.save(any(StudentEntity.class))).thenReturn(entity);

        StudentDto result = studentService.addStudent(request);

        assertThat(result).isNotNull();
        assertThat(result.email()).isEqualTo("jean.dupont@example.com");
        assertThat(result.status()).isEqualTo(AccountStatus.PENDING);
        verify(studentRepository, times(1)).save(any(StudentEntity.class));
    }

    @Test
    void updateStudent_Success() {
        StudentRequestDto request = new StudentRequestDto(
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
}