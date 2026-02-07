package fr.fst.forumstages.backend.user;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends MongoRepository<UserEntity, String> {

    Optional<UserEntity> findByEmail(String email);

    // Nouvelles méthodes pour récupérer user depuis student ou company
    Optional<UserEntity> findByStudentId(String studentId);

    Optional<UserEntity> findByCompanyId(String companyId);

    Long countByRole(UserRole role);

    Long countByRoleAndCreatedAtBefore(UserRole role, LocalDateTime date);
}
