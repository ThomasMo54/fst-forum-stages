package fr.fst.forumstages.backend.offer;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface OfferRepository extends MongoRepository<OfferEntity, String> {
}
