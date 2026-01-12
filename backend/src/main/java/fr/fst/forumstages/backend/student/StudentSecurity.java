package fr.fst.forumstages.backend.student;

import fr.fst.forumstages.backend.user.UserEntity;
import fr.fst.forumstages.backend.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("studentSecurity")
public class StudentSecurity {

    private final UserRepository userRepository;

    public StudentSecurity(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean isOwner(Authentication authentication, String studentId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        Optional<UserEntity> user = userRepository.findByEmail(authentication.getName());
        return user.map(userEntity -> userEntity.getStudent().getId().equals(studentId))
                .orElse(false);
    }
}
