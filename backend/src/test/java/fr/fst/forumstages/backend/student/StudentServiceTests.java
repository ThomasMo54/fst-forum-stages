package fr.fst.forumstages.backend.student;

import fr.fst.forumstages.backend.application.ApplicationEntity;
import fr.fst.forumstages.backend.application.ApplicationService;
import fr.fst.forumstages.backend.student.dto.StudentDto;
import fr.fst.forumstages.backend.student.dto.UpdateStudentDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceTests {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private ApplicationService applicationService;

    @InjectMocks
    private StudentService studentService;

    private String studentId;
    private StudentEntity mockStudent;

    @BeforeEach
    void setUp() {
        studentId = "test-student-id";
        mockStudent = new StudentEntity();
        mockStudent.setId(studentId);
        mockStudent.setEmail("student@example.com");
    }

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
    @DisplayName("Should delete student and their applications successfully")
    void testDeleteStudentById_Success() {
        // Arrange
        ApplicationEntity app1 = new ApplicationEntity();
        app1.setId("app-1");
        ApplicationEntity app2 = new ApplicationEntity();
        app2.setId("app-2");
        List<ApplicationEntity> applications = new ArrayList<>();
        applications.add(app1);
        applications.add(app2);

        when(studentRepository.existsById(studentId)).thenReturn(true);
        when(applicationService.getApplicationsForStudent(studentId)).thenReturn(applications);

        // Act
        studentService.deleteStudentById(studentId);

        // Assert
        verify(studentRepository, times(1)).existsById(studentId);
        verify(applicationService, times(1)).getApplicationsForStudent(studentId);
        verify(applicationService, times(2)).deleteApplication(anyString());
        verify(applicationService, times(1)).deleteApplication("app-1");
        verify(applicationService, times(1)).deleteApplication("app-2");
        verify(studentRepository, times(1)).deleteById(studentId);
    }

    @Test
    @DisplayName("Should delete student without applications successfully")
    void testDeleteStudentById_NoApplications() {
        // Arrange
        when(studentRepository.existsById(studentId)).thenReturn(true);
        when(applicationService.getApplicationsForStudent(studentId)).thenReturn(new ArrayList<>());

        // Act
        studentService.deleteStudentById(studentId);

        // Assert
        verify(studentRepository, times(1)).existsById(studentId);
        verify(applicationService, times(1)).getApplicationsForStudent(studentId);
        verify(applicationService, never()).deleteApplication(anyString());
        verify(studentRepository, times(1)).deleteById(studentId);
    }

    @Test
    @DisplayName("Should throw NoSuchElementException when student doesn't exist")
    void testDeleteStudentById_StudentNotFound() {
        // Arrange
        when(studentRepository.existsById(studentId)).thenReturn(false);

        // Act & Assert
        NoSuchElementException exception = assertThrows(
                NoSuchElementException.class,
                () -> studentService.deleteStudentById(studentId)
        );
        assertTrue(exception.getMessage().contains("Offer with id"));
        verify(studentRepository, times(1)).existsById(studentId);
        verify(studentRepository, never()).deleteById(anyString());
    }

    @Test
    @DisplayName("Should handle multiple applications deletion")
    void testDeleteStudentById_MultipleApplications() {
        // Arrange
        List<ApplicationEntity> applications = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            ApplicationEntity app = new ApplicationEntity();
            app.setId("app-" + i);
            applications.add(app);
        }

        when(studentRepository.existsById(studentId)).thenReturn(true);
        when(applicationService.getApplicationsForStudent(studentId)).thenReturn(applications);

        // Act
        studentService.deleteStudentById(studentId);

        // Assert
        verify(applicationService, times(5)).deleteApplication(anyString());
        verify(studentRepository, times(1)).deleteById(studentId);
    }
}
