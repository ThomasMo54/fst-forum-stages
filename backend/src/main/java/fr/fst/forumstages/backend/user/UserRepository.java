package fr.fst.forumstages.backend.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<UserEntity, String> {

    Page<UserEntity> findAll(Pageable pageable);

    Page<UserEntity> findAllByRole(UserRole role, Pageable pageable);

    Optional<UserEntity> findByEmail(String email);

    // Nouvelles méthodes pour récupérer user depuis student ou company
    Optional<UserEntity> findByStudentId(String studentId);

    Optional<UserEntity> findByCompanyId(String companyId);

    Long countByRole(UserRole role);

    Long countByRoleAndCreatedAtBefore(UserRole role, LocalDateTime date);

    List<UserEntity> findByRole(UserRole role);
}
