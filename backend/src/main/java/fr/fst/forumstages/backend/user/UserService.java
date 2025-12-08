package fr.fst.forumstages.backend.user;

import fr.fst.forumstages.backend.company.CompanyEntity;
import fr.fst.forumstages.backend.company.CompanyRepository;
import fr.fst.forumstages.backend.company.dto.CompanyDto;
import fr.fst.forumstages.backend.company.dto.CreateCompanyDto;
import fr.fst.forumstages.backend.student.StudentEntity;
import fr.fst.forumstages.backend.student.StudentRepository;
import fr.fst.forumstages.backend.student.dto.CreateStudentDto;
import fr.fst.forumstages.backend.email.EmailService;
import fr.fst.forumstages.backend.user.dto.CreateAdminUserDto;
import fr.fst.forumstages.backend.user.dto.UpdateUserDto;
import fr.fst.forumstages.backend.user.exception.TooManyRequestsException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final StudentRepository studentRepository;

    private final PasswordEncoder passwordEncoder;

    private final Map<String, Long> verificationCodeRequestTimestamps = new HashMap<>();

    public UserService(
            UserRepository userRepository,
            CompanyRepository companyRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserEntity createAdminUser(CreateAdminUserDto createAdminDto) {
        if (userRepository.findByEmail(createAdminDto.email()).isPresent()) {
            throw new DuplicateKeyException("Email already in use");
        }
        UserEntity userEntity = createUser(createAdminDto.email(), createAdminDto.password(), UserRole.ADMIN);
        return userRepository.save(userEntity);
    }

    public UserEntity createCompanyUser(CreateCompanyDto createCompanyDto) {
        if (userRepository.findByEmail(createCompanyDto.email()).isPresent()) {
            throw new DuplicateKeyException("Email already in use");
        }
        UserEntity userEntity = createUser(createCompanyDto.email(), createCompanyDto.password(), UserRole.COMPANY);
        CompanyDto companyDto = new CompanyDto(
                null,
                createCompanyDto.name(),
                createCompanyDto.contactEmail(),
                createCompanyDto.streetAddress(),
                createCompanyDto.city(),
                createCompanyDto.postalCode(),
                createCompanyDto.country()
        );
        CompanyEntity companyEntity = companyRepository.save(CompanyEntity.fromDto(companyDto));
        userEntity.setCompany(companyEntity);
        return userRepository.save(userEntity);
    }

    @Transactional
    public UserEntity createStudentUser(CreateStudentDto createStudentDto) {
        if (userRepository.findByEmail(createStudentDto.email()).isPresent()) {
            throw new DuplicateKeyException("Email already in use");
        }
        UserEntity userEntity = createUser(createStudentDto.email(), createStudentDto.password(), UserRole.STUDENT);

        // Sauvegarder d'abord l'utilisateur pour obtenir son ID
        userEntity = userRepository.save(userEntity);

        // Créer le profil étudiant
        StudentEntity studentEntity = new StudentEntity();
        studentEntity.setFirstName(createStudentDto.firstName());
        studentEntity.setLastName(createStudentDto.lastName());
        studentEntity.setEmail(createStudentDto.email());
        studentEntity.setStudentNumber(createStudentDto.studentNumber());
        studentEntity.setPhone(createStudentDto.phone());
        studentEntity.setEducationLevel(createStudentDto.educationLevel());
        studentEntity.setFieldOfStudy(createStudentDto.fieldOfStudy());
        studentEntity.setSpecialization(createStudentDto.specialization());
        studentEntity.setYearOfStudy(createStudentDto.yearOfStudy());
        studentEntity.setSkills(createStudentDto.skills());

        studentEntity.setUser(userEntity);

        studentEntity = studentRepository.save(studentEntity);

        userEntity.setStudent(studentEntity);

        return userEntity;
    }

    private UserEntity createUser(String email, String password, UserRole role) {
        UserEntity userEntity = new UserEntity();
        userEntity.setEmail(email);
        userEntity.setPassword(passwordEncoder.encode(password));
        userEntity.setRole(role);
        userEntity.setVerificationCode(generateVerificationCode());
        userEntity.setVerificationCodeExpiry(LocalDateTime.now().plusSeconds(EmailService.EXPIRY_DURATION_MS / 1000));
        return userEntity;
    }

    private String generateVerificationCode() {
        return String.format("%06d", (int) (Math.random() * 1000000));
    }

    public boolean verifyUser(String email, String code) {
        UserEntity userEntity = findByEmail(email);
        if (userEntity.isVerified()) {
            throw new IllegalStateException("User is already verified");
        }
        if (userEntity.getVerificationCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired");
        }
        if (!userEntity.getVerificationCode().equals(code)) {
            throw new IllegalArgumentException("Invalid verification code");
        }
        userEntity.setVerified(true);
        userEntity.setVerificationCode(null);
        userEntity.setVerificationCodeExpiry(null);
        userRepository.save(userEntity);
        return true;
    }

    public String refreshVerificationCode(String email) {
        UserEntity userEntity = findByEmail(email);
        if (userEntity.isVerified()) {
            throw new IllegalStateException("User is already verified");
        }
        if (verificationCodeRequestTimestamps.containsKey(email)) {
            long lastRequestTime = verificationCodeRequestTimestamps.get(email);
            if (System.currentTimeMillis() - lastRequestTime < 30000) { // 30 seconds cooldown
                throw new TooManyRequestsException("Verification code was recently sent. Please wait before requesting a new one.");
            }
        }
        String code = generateVerificationCode();
        userEntity.setVerificationCode(code);
        userEntity.setVerificationCodeExpiry(LocalDateTime.now().plusSeconds(EmailService.EXPIRY_DURATION_MS / 1000));
        userRepository.save(userEntity);
        verificationCodeRequestTimestamps.put(email, System.currentTimeMillis());
        return code;
    }

    public UserEntity findById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User with id " + id + " not found"));
    }

    public UserEntity findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User with email " + email + " not found"));
    }

    public UserEntity updateUser(String id, UpdateUserDto updateUserDto) {
        UserEntity existingUser = findById(id);
        if (updateUserDto.email() != null) {
            existingUser.setEmail(updateUserDto.email());
        }
        if (updateUserDto.password() != null) {
            existingUser.setPassword(passwordEncoder.encode(updateUserDto.password()));
        }
        return userRepository.save(existingUser);
    }

    public void deleteUser(String id) {
        UserEntity existingUser = findById(id);
        userRepository.delete(existingUser);
        if (existingUser.getCompany() != null) {
            companyRepository.delete(existingUser.getCompany());
        }
        if (existingUser.getStudent() != null) {
            studentRepository.delete(existingUser.getStudent());
        }
    }
}
