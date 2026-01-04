package fr.fst.forumstages.backend.offer;

import fr.fst.forumstages.backend.application.dto.ApplicationDto;
import fr.fst.forumstages.backend.user.UserEntity;
import fr.fst.forumstages.backend.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("offerSecurity")
public class OfferSecurity {
    private final UserRepository userRepository;

    public OfferSecurity(OfferRepository offerRepository, UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean isOwner(Authentication authentication,String companyId, String offerId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        Optional<UserEntity> user = userRepository.findByEmail(authentication.getName());
        return user.map(userEntity -> userEntity.getCompany().getId().equals(companyId) && userEntity.getCompany().getPublishedOffers().stream().map(OfferEntity::getId).anyMatch(offerId::equals))
                .orElse(false);
    }
}
