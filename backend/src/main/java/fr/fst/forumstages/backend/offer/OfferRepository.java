package fr.fst.forumstages.backend.offer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OfferRepository extends MongoRepository<OfferEntity, String> {

    Long countByCreationDateBefore(LocalDateTime date);

    Page<OfferEntity> findOfferEntitiesByCompany_Id(String companyId, Pageable pageable);
    Page<OfferEntity> findByOfferOpenTrue(Pageable pageable);
    List<OfferEntity> findByOfferOpenTrue(Sort sort);
}
