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
}
