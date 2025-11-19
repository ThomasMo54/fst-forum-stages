package fr.fst.forumstages.backend.user;

import fr.fst.forumstages.backend.company.CompanyEntity;
import fr.fst.forumstages.backend.company.CompanyRepository;
import fr.fst.forumstages.backend.company.CompanyService;
import fr.fst.forumstages.backend.company.dto.CompanyDto;
import fr.fst.forumstages.backend.company.dto.CreateCompanyDto;
import fr.fst.forumstages.backend.user.dto.CreateAdminUserDto;
import fr.fst.forumstages.backend.user.dto.UpdateUserDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            CompanyRepository companyRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserEntity createAdminUser(CreateAdminUserDto createAdminDto) {
        UserEntity userEntity = createUser(createAdminDto.email(), createAdminDto.password(), UserRole.ADMIN);
        return userRepository.save(userEntity);
    }

    public UserEntity createCompanyUser(CreateCompanyDto createCompanyDto) {
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

    // TODO: Add createStudentUser method

    private UserEntity createUser(String email, String password, UserRole role) {
        UserEntity userEntity = new UserEntity();
        userEntity.setEmail(email);
        userEntity.setPassword(passwordEncoder.encode(password));
        userEntity.setRole(role);
        return userEntity;
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
        // TODO: Add StudentEntity deletion if applicable
    }
}
