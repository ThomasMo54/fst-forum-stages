package fr.fst.forumstages.backend.user;

import fr.fst.forumstages.backend.company.CompanyEntity;
import fr.fst.forumstages.backend.company.CompanyRepository;
import fr.fst.forumstages.backend.company.CompanyService;
import fr.fst.forumstages.backend.company.dto.CreateCompanyDto;
import fr.fst.forumstages.backend.notification.NotificationService;
import fr.fst.forumstages.backend.student.StudentEntity;
import fr.fst.forumstages.backend.student.StudentRepository;
import fr.fst.forumstages.backend.student.StudentService;
import fr.fst.forumstages.backend.student.dto.CreateStudentDto;
import fr.fst.forumstages.backend.user.dto.CreateAdminUserDto;
import fr.fst.forumstages.backend.user.dto.UpdateUserDto;
import fr.fst.forumstages.backend.user.exception.TooManyRequestsException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;

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

    @Mock
    private NotificationService notificationService;

    @Mock
    private StudentService studentService;

    @Mock
    private CompanyService companyService;

    @BeforeEach
    void setUp() {
        // Initialisation si nécessaire
    }

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
        assertFalse(createdUser.isVerified());

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
        assertEquals(UserRole.COMPANY, createdUser.getRole());
        assertFalse(createdUser.isVerified());
        assertEquals(createdUser, result);

        assertNull(createdCompany.getId());
        assertEquals("Test Company", createdCompany.getName());
        assertEquals("c@d.fr", createdCompany.getContactEmail());
        assertEquals(createdCompany, createdUser.getCompany());
    }

    @Test
    public void createStudentUser_success() {
        String password = "12345678";
        String encodedPassword = "encodedPassword";
        CreateStudentDto createStudentDto = new CreateStudentDto(
                "a@b.fr",
                password,
                "John",
                "Doe",
                "S123456",
                "1234567890",
                "Bachelor's",
                "Computer Science",
                "Software Engineering",
                2,
                Arrays.asList("Java", "Spring")
        );

        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(studentRepository.save(any(StudentEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(passwordEncoder.encode(password)).thenReturn(encodedPassword);
        ArgumentCaptor<UserEntity> userCaptor = ArgumentCaptor.forClass(UserEntity.class);
        ArgumentCaptor<StudentEntity> studentCaptor = ArgumentCaptor.forClass(StudentEntity.class);

        UserEntity result = userService.createStudentUser(createStudentDto);

        verify(userRepository, times(1)).save(userCaptor.capture());
        verify(studentRepository, times(1)).save(studentCaptor.capture());

        UserEntity createdUser = userCaptor.getValue();
        StudentEntity createdStudent = studentCaptor.getValue();

        assertEquals("a@b.fr", createdUser.getEmail());
        assertEquals(encodedPassword, createdUser.getPassword());
        assertEquals(UserRole.STUDENT, createdUser.getRole());
        assertFalse(createdUser.isVerified());
        assertEquals(createdUser, result);
        assertNull(createdStudent.getId());

        assertEquals("John", createdStudent.getFirstName());
        assertEquals("Doe", createdStudent.getLastName());
        assertEquals("a@b.fr", createdStudent.getEmail());
        assertEquals("S123456", createdStudent.getStudentNumber());
        assertEquals("1234567890", createdStudent.getPhone());
        assertEquals("Bachelor's", createdStudent.getEducationLevel());
        assertEquals("Computer Science", createdStudent.getFieldOfStudy());
        assertEquals("Software Engineering", createdStudent.getSpecialization());
        assertEquals(2, createdStudent.getYearOfStudy());
        assertEquals(Arrays.asList("Java", "Spring"), createdStudent.getSkills());
        assertEquals(createdStudent, createdUser.getStudent());
    }

    @Test
    public void verifyUser_success() {
        String email = "a@b.fr";
        String code = "123456";
        UserEntity mockUser = new UserEntity();
        mockUser.setEmail(email);
        mockUser.setVerificationCode(code);
        mockUser.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(15));

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));

        assertDoesNotThrow(() -> userService.verifyUser(email, code));
        assertTrue(mockUser.isVerified());

        verify(userRepository, times(1)).save(mockUser);
    }

    @Test
    public void verifyUser_invalidCode() {
        String email = "a@b.fr";
        String code = "123456";
        UserEntity mockUser = new UserEntity();
        mockUser.setEmail(email);
        mockUser.setVerificationCode("654321");
        mockUser.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(15));

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));

        assertThrows(IllegalArgumentException.class, () -> userService.verifyUser(email, code));
        assertFalse(mockUser.isVerified());

        verify(userRepository, times(0)).save(mockUser);
    }

    @Test
    public void verifyUser_expiredCode() {
        String email = "a@b.fr";
        String code = "123456";
        UserEntity mockUser = new UserEntity();
        mockUser.setEmail(email);
        mockUser.setVerificationCode(code);
        mockUser.setVerificationCodeExpiry(LocalDateTime.now().minusMinutes(1));

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));

        assertThrows(IllegalArgumentException.class, () -> userService.verifyUser(email, code));
        assertFalse(mockUser.isVerified());

        verify(userRepository, times(0)).save(mockUser);
    }

    @Test
    public void verifyUser_alreadyVerified() {
        String email = "a@b.fr";
        String code = "123456";
        UserEntity mockUser = new UserEntity();
        mockUser.setEmail(email);
        mockUser.setVerified(true);
        mockUser.setVerificationCode(code);
        mockUser.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(15));

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));

        assertThrows(IllegalStateException.class, () -> userService.verifyUser(email, code));

        verify(userRepository, times(0)).save(mockUser);
    }

    @Test
    public void refreshVerificationCode_success() {
        String email = "a@b.fr";
        UserEntity mockUser = new UserEntity();
        mockUser.setEmail(email);
        mockUser.setVerified(false);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));

        assertDoesNotThrow(() -> userService.refreshVerificationCode(email));

        verify(userRepository, times(1)).save(mockUser);
    }

    @Test
    public void refreshVerificationCode_alreadyVerified() {
        String email = "a@b.fr";
        UserEntity mockUser = new UserEntity();
        mockUser.setEmail(email);
        mockUser.setVerified(true);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));

        assertThrows(IllegalStateException.class, () -> userService.refreshVerificationCode(email));

        verify(userRepository, times(0)).save(mockUser);
    }

    @Test
    public void refreshVerificationCode_tooManyRequests() {
        String email = "a@b.fr";
        UserEntity mockUser = new UserEntity();
        mockUser.setEmail(email);
        mockUser.setVerified(false);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));

        userService.refreshVerificationCode(email); // First request should succeed

        assertThrows(TooManyRequestsException.class, () -> userService.refreshVerificationCode(email)); // Second request should fail

        verify(userRepository, times(1)).save(mockUser);
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

        verify(userRepository, times(1)).save(mockUser);
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

        verify(userRepository, times(1)).save(mockUser);
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
    @DisplayName("Should delete user with student profile successfully")
    void testDeleteUser_WithStudent() {
        // Arrange
        String userId = "test-user-id";
        StudentEntity student = new StudentEntity();
        student.setId("student-id");
        UserEntity mockUser = new UserEntity();
        mockUser.setId(userId);
        mockUser.setStudent(student);

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // Act
        userService.deleteUser(userId);

        // Assert
        verify(notificationService, times(1)).deleteUserNotifications(userId);
        verify(userRepository, times(1)).findById(userId);
        verify(userRepository, times(1)).delete(mockUser);
        verify(studentService, times(1)).deleteStudentById("student-id");
        verify(companyService, never()).deleteCompany(anyString());
    }

    @Test
    @DisplayName("Should delete user with company profile successfully")
    void testDeleteUser_WithCompany() {
        // Arrange
        String userId = "test-user-id";
        CompanyEntity company = new CompanyEntity();
        company.setId("company-id");
        UserEntity mockUser = new UserEntity();
        mockUser.setId(userId);
        mockUser.setCompany(company);
        mockUser.setStudent(null);

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // Act
        userService.deleteUser(userId);

        // Assert
        verify(notificationService, times(1)).deleteUserNotifications(userId);
        verify(userRepository, times(1)).findById(userId);
        verify(userRepository, times(1)).delete(mockUser);
        verify(companyService, times(1)).deleteCompany("company-id");
        verify(studentService, never()).deleteStudentById(anyString());
    }

    @Test
    @DisplayName("Should delete user with both student and company profiles")
    void testDeleteUser_WithBothProfiles() {
        // Arrange
        String userId = "test-user-id";
        StudentEntity student = new StudentEntity();
        student.setId("student-id");
        CompanyEntity company = new CompanyEntity();
        company.setId("company-id");
        UserEntity mockUser = new UserEntity();
        mockUser.setId(userId);
        mockUser.setStudent(student);
        mockUser.setCompany(company);

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // Act
        userService.deleteUser(userId);

        // Assert
        verify(notificationService, times(1)).deleteUserNotifications(userId);
        verify(userRepository, times(1)).findById(userId);
        verify(userRepository, times(1)).delete(mockUser);
        verify(studentService, times(1)).deleteStudentById("student-id");
        verify(companyService, times(1)).deleteCompany("company-id");
    }

    @Test
    @DisplayName("Should delete user with no profiles successfully")
    void testDeleteUser_WithoutProfiles() {
        // Arrange
        String userId = "test-user-id";
        UserEntity mockUser = new UserEntity();
        mockUser.setId(userId);
        mockUser.setStudent(null);
        mockUser.setCompany(null);

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // Act
        userService.deleteUser(userId);

        // Assert
        verify(notificationService, times(1)).deleteUserNotifications(userId);
        verify(userRepository, times(1)).findById(userId);
        verify(userRepository, times(1)).delete(mockUser);
        verify(studentService, never()).deleteStudentById(anyString());
        verify(companyService, never()).deleteCompany(anyString());
    }

    @Test
    @DisplayName("Should throw NoSuchElementException when user doesn't exist")
    void testDeleteUser_UserNotFound() {
        // Arrange
        String userId = "test-user-id";
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        NoSuchElementException exception = assertThrows(
                NoSuchElementException.class,
                () -> userService.deleteUser(userId)
        );
        assertTrue(exception.getMessage().contains("User with id"));
        verify(userRepository, times(1)).findById(userId);
        verify(userRepository, never()).delete(any());
        verify(notificationService, times(1)).deleteUserNotifications(userId);
    }

    @Test
    @DisplayName("Should always delete notifications regardless of user existence")
    void testDeleteUser_DeletesNotificationsBeforeDeletingUser() {
        // Arrange
        String userId = "test-user-id";
        UserEntity mockUser = new UserEntity();
        mockUser.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // Act
        userService.deleteUser(userId);

        // Assert
        verify(notificationService, times(1)).deleteUserNotifications(userId);
        verify(userRepository, times(1)).delete(mockUser);
    }

    @Test
    @DisplayName("Should handle null student in user profile")
    void testDeleteUser_NullStudent() {
        // Arrange
        String userId = "test-user-id";
        UserEntity mockUser = new UserEntity();
        mockUser.setId(userId);
        mockUser.setStudent(null);
        mockUser.setCompany(null);

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        // Act
        userService.deleteUser(userId);

        // Assert
        verify(studentService, never()).deleteStudentById(anyString());
        verify(companyService, never()).deleteCompany(anyString());
    }

}
