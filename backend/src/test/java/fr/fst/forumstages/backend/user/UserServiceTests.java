package fr.fst.forumstages.backend.user;

import fr.fst.forumstages.backend.company.CompanyEntity;
import fr.fst.forumstages.backend.company.CompanyRepository;
import fr.fst.forumstages.backend.company.dto.CreateCompanyDto;
import fr.fst.forumstages.backend.student.StudentEntity;
import fr.fst.forumstages.backend.student.StudentRepository;
import fr.fst.forumstages.backend.student.dto.CreateStudentUserDto;
import fr.fst.forumstages.backend.user.dto.CreateAdminUserDto;
import fr.fst.forumstages.backend.user.dto.UpdateUserDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserServiceTests {

    @InjectMocks
    private UserService userService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserRepository userRepository;
    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private StudentRepository studentRepository;

    @Test
    public void createAdminUser_success() {
        String password = "12345678";
        String encodedPassword = "encodedPassword";

        CreateAdminUserDto createAdminUserDto = new CreateAdminUserDto(
                "a@b.fr",
                password
        );

        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(passwordEncoder.encode(password)).thenReturn(encodedPassword);
        ArgumentCaptor<UserEntity> userCaptor = ArgumentCaptor.forClass(UserEntity.class);

        UserEntity result = userService.createAdminUser(createAdminUserDto);

        verify(userRepository, times(1)).save(userCaptor.capture());

        UserEntity createdUser = userCaptor.getValue();

        assertEquals("a@b.fr", createdUser.getEmail());
        assertEquals(encodedPassword, createdUser.getPassword());
        assertEquals(UserRole.ADMIN, createdUser.getRole());

        assertEquals(createdUser, result);
    }

    @Test
    public void createCompanyUser_success() {
        String password = "12345678";
        String encodedPassword = "encodedPassword";

        CreateCompanyDto createCompanyDto = new CreateCompanyDto(
                "a@b.fr",
                password,
                "Test Company",
                "c@d.fr",
                null,
                null,
                null,
                null
        );

        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(companyRepository.save(any(CompanyEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(passwordEncoder.encode(password)).thenReturn(encodedPassword);
        ArgumentCaptor<UserEntity> userCaptor = ArgumentCaptor.forClass(UserEntity.class);
        ArgumentCaptor<CompanyEntity> companyCaptor = ArgumentCaptor.forClass(CompanyEntity.class);

        UserEntity result = userService.createCompanyUser(createCompanyDto);

        verify(userRepository, times(1)).save(userCaptor.capture());
        verify(companyRepository, times(1)).save(companyCaptor.capture());

        UserEntity createdUser = userCaptor.getValue();
        CompanyEntity createdCompany = companyCaptor.getValue();

        assertEquals("a@b.fr", createdUser.getEmail());
        assertEquals(encodedPassword, createdUser.getPassword());
        assertEquals(createdUser, result);

        assertNull(createdCompany.getId());
        assertEquals("Test Company", createdCompany.getName());
        assertEquals("c@d.fr", createdCompany.getContactEmail());
        assertEquals(createdCompany, createdUser.getCompany());
    }

    @Test
    public void findById_success() {
        String userId = "123";
        UserEntity mockUser = new UserEntity();
        mockUser.setId(userId);
        mockUser.setEmail("a@b.fr");

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        UserEntity result = userService.findById(userId);
        assertEquals(mockUser, result);
    }

    @Test
    public void findById_notFound() {
        String userId = "nonexistent-id";

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> userService.findById(userId));
    }

    @Test
    public void findByEmail_success() {
        String email = "a@b.fr";
        UserEntity mockUser = new UserEntity();
        mockUser.setId("123");
        mockUser.setEmail(email);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));

        UserEntity result = userService.findByEmail(email);
        assertEquals(mockUser, result);
    }

    @Test
    public void findByEmail_notFound() {
        String email = "nonexistent-email";

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> userService.findByEmail(email));
    }

    @Test
    public void updateUser_success() {
        String userId = "123";
        UserEntity mockUser = new UserEntity();
        mockUser.setId(userId);
        mockUser.setEmail("a@b.fr");
        mockUser.setPassword("oldPassword");

        String newPassword = "newPassword";
        String encodedNewPassword = "encodedNewPassword";
        UpdateUserDto updateUserDto = new UpdateUserDto(
                "c@d.fr",
                newPassword
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.encode(newPassword)).thenReturn(encodedNewPassword);
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserEntity result = userService.updateUser(userId, updateUserDto);

        assertEquals("c@d.fr", result.getEmail());
        assertEquals(encodedNewPassword, result.getPassword());
    }

    @Test
    public void updateUser_partialUpdate_success() {
        String userId = "123";
        UserEntity mockUser = new UserEntity();
        mockUser.setId(userId);
        mockUser.setEmail("a@b.fr");
        mockUser.setPassword("oldPassword");

        String newPassword = "newPassword";
        String encodedNewPassword = "encodedNewPassword";
        UpdateUserDto updateUserDto = new UpdateUserDto(
                null,
                "newPassword"
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.encode(newPassword)).thenReturn(encodedNewPassword);
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserEntity result = userService.updateUser(userId, updateUserDto);

        assertEquals("a@b.fr", result.getEmail());
        assertEquals(encodedNewPassword, result.getPassword());
    }

    @Test
    public void deleteUser_admin_success() {
        String userId = "123";
        UserEntity mockUser = new UserEntity();
        mockUser.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        userService.deleteUser(userId);

        verify(userRepository, times(1)).delete(mockUser);
    }

    @Test
    public void deleteUser_company_success() {
        String userId = "123";
        UserEntity mockUser = new UserEntity();
        mockUser.setId(userId);

        CompanyEntity mockCompany = new CompanyEntity();
        mockCompany.setId("comp-123");
        mockUser.setCompany(mockCompany);

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        userService.deleteUser(userId);

        verify(userRepository, times(1)).delete(mockUser);
        verify(companyRepository, times(1)).delete(mockCompany);
    }

    @Test
    public void createStudentUser_success() {
        String password = "12345678";
        String encodedPassword = "encodedPassword";
        List<String> skills = Arrays.asList("Java", "Spring Boot", "MongoDB");

        CreateStudentUserDto createStudentUserDto = new CreateStudentUserDto(
                "student@university.fr",
                password,
                "Jean",
                "Dupont",
                "STU123456",
                "+33612345678",
                "Master",
                "Informatique",
                "Développement Web",
                2,
                skills
        );

        when(passwordEncoder.encode(password)).thenReturn(encodedPassword);
        when(studentRepository.save(any(StudentEntity.class))).thenAnswer(invocation -> {
            StudentEntity student = invocation.getArgument(0);
            student.setId("student-123");
            return student;
        });
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> {
            UserEntity user = invocation.getArgument(0);
            user.setId("user-123");
            return user;
        });

        ArgumentCaptor<StudentEntity> studentCaptor = ArgumentCaptor.forClass(StudentEntity.class);
        ArgumentCaptor<UserEntity> userCaptor = ArgumentCaptor.forClass(UserEntity.class);

        UserEntity result = userService.createStudentUser(createStudentUserDto);

        // Vérifier que le student est sauvegardé
        verify(studentRepository, times(1)).save(studentCaptor.capture());

        // Vérifier que l'user est sauvegardé UNE SEULE fois (pas 2)
        verify(userRepository, times(1)).save(userCaptor.capture());

        StudentEntity createdStudent = studentCaptor.getValue();
        assertEquals("Jean", createdStudent.getFirstName());
        assertEquals("Dupont", createdStudent.getLastName());
        assertEquals("student@university.fr", createdStudent.getEmail());
        assertEquals("STU123456", createdStudent.getStudentNumber());
        assertEquals("+33612345678", createdStudent.getPhone());
        assertEquals("Master", createdStudent.getEducationLevel());
        assertEquals("Informatique", createdStudent.getFieldOfStudy());
        assertEquals("Développement Web", createdStudent.getSpecialization());
        assertEquals(2, createdStudent.getYearOfStudy());
        assertEquals(skills, createdStudent.getSkills());

        UserEntity capturedUser = userCaptor.getValue();

        assertEquals("student@university.fr", capturedUser.getEmail());
        assertEquals(encodedPassword, capturedUser.getPassword());
        assertEquals(UserRole.STUDENT, capturedUser.getRole());
        assertNotNull(capturedUser.getStudent());
        assertEquals(createdStudent, capturedUser.getStudent());

        assertEquals(capturedUser, result);
    }

    @Test
    public void createStudentUser_withoutOptionalFields_success() {
        String password = "12345678";
        String encodedPassword = "encodedPassword";

        CreateStudentUserDto createStudentUserDto = new CreateStudentUserDto(
                "student@university.fr",
                password,
                "Marie",
                "Martin",
                "STU789012",
                null, // phone optionnel
                "Licence",
                "Mathématiques",
                null, // specialization optionnelle
                1,
                null // skills optionnelles
        );

        when(passwordEncoder.encode(password)).thenReturn(encodedPassword);
        when(studentRepository.save(any(StudentEntity.class))).thenAnswer(invocation -> {
            StudentEntity student = invocation.getArgument(0);
            student.setId("student-456");
            return student;
        });
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> {
            UserEntity user = invocation.getArgument(0);
            user.setId("user-456");
            return user;
        });

        ArgumentCaptor<StudentEntity> studentCaptor = ArgumentCaptor.forClass(StudentEntity.class);

        UserEntity result = userService.createStudentUser(createStudentUserDto);

        verify(studentRepository, times(1)).save(studentCaptor.capture());
        verify(userRepository, times(1)).save(any(UserEntity.class));

        StudentEntity createdStudent = studentCaptor.getValue();
        assertEquals("Marie", createdStudent.getFirstName());
        assertEquals("Martin", createdStudent.getLastName());
        assertNull(createdStudent.getPhone());
        assertNull(createdStudent.getSpecialization());
        assertNull(createdStudent.getSkills());

        assertNotNull(result.getStudent());
    }

    @Test
    public void deleteUser_student_success() {
        String userId = "123";
        UserEntity mockUser = new UserEntity();
        mockUser.setId(userId);

        StudentEntity mockStudent = new StudentEntity();
        mockStudent.setId("student-123");
        mockUser.setStudent(mockStudent);

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        userService.deleteUser(userId);

        verify(userRepository, times(1)).delete(mockUser);
        verify(studentRepository, times(1)).delete(mockStudent);
    }

}
