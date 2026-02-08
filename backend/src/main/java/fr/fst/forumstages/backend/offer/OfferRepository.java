package fr.fst.forumstages.backend.offer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OfferRepository extends MongoRepository<OfferEntity, String> {
    Page<OfferEntity> findOfferEntitiesByCompany_Id(String companyId, Pageable pageable);
    Page<OfferEntity> findByOfferOpenTrue(Pageable pageable);
}
