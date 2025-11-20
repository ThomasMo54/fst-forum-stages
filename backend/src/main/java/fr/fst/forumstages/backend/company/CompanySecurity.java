package fr.fst.forumstages.backend.company;

import fr.fst.forumstages.backend.user.UserEntity;
import fr.fst.forumstages.backend.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("companySecurity")
public class CompanySecurity {

    private final UserRepository userRepository;

    public CompanySecurity(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean isOwner(Authentication authentication, String companyId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        Optional<UserEntity> user = userRepository.findByEmail(authentication.getName());
        return user.map(userEntity -> userEntity.getCompany().getId().equals(companyId))
                .orElse(false);
    }
}
