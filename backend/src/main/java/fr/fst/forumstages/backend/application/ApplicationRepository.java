package fr.fst.forumstages.backend.application;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface ApplicationRepository extends MongoRepository<ApplicationEntity, String> {
    @Query("{ 'offerId' : ?0 }")
    List<ApplicationEntity> findByOfferId(String offerId);

    @Query("{ 'studentId' : ?0 }")
    List<ApplicationEntity> findByStudentId(String offerId);

    @Query(value = "{ 'offerId' : ?0 }", count = true)
    int countByOfferId(String offerId);

    Long countByCreatedAtBefore(LocalDateTime date);
}
