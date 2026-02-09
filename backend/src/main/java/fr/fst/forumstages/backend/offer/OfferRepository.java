package fr.fst.forumstages.backend.offer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;

public interface OfferRepository extends MongoRepository<OfferEntity, String> {

    Long countByCreationDateBefore(LocalDateTime date);

    Page<OfferEntity> findOfferEntitiesByCompany_Id(String companyId, Pageable pageable);
}
