package fr.fst.forumstages.backend.offer;

import fr.fst.forumstages.backend.offer.dto.OfferSearchFilter;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Repository
public class OfferSearchRepository {
    private final MongoTemplate mongoTemplate;

    public OfferSearchRepository(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public List<OfferEntity> findByFilter(OfferSearchFilter filter) {
        List<Criteria> criteriaList = new ArrayList<>();

        if (filter.query() != null && !filter.query().isBlank()) {
            String escaped = Pattern.quote(filter.query().trim());
            Criteria textCriteria = new Criteria().orOperator(
                    Criteria.where("title").regex(escaped, "i"),
                    Criteria.where("description").regex(escaped, "i"),
                    Criteria.where("tags").regex(escaped, "i")
            );
            criteriaList.add(textCriteria);
        }

        if (filter.tags() != null && !filter.tags().isEmpty()) {
            criteriaList.add(Criteria.where("tags").in(filter.tags()));
        }

        if (filter.studyLevel() != null && !filter.studyLevel().isBlank()) {
            String escaped = Pattern.quote(filter.studyLevel().trim());
            criteriaList.add(Criteria.where("studyLevel").regex(escaped, "i"));
        }

        if (filter.remotePolicy() != null && !filter.remotePolicy().isBlank() && !"any".equalsIgnoreCase(filter.remotePolicy())) {
            if ("remote".equalsIgnoreCase(filter.remotePolicy())) {
                criteriaList.add(Criteria.where("remoteWorkPolicy").ne(null).ne(""));
            } else if ("onsite".equalsIgnoreCase(filter.remotePolicy())) {
                criteriaList.add(new Criteria().orOperator(
                        Criteria.where("remoteWorkPolicy").is(null),
                        Criteria.where("remoteWorkPolicy").is("")
                ));
            } else {
                String escaped = Pattern.quote(filter.remotePolicy().trim());
                criteriaList.add(Criteria.where("remoteWorkPolicy").regex(escaped, "i"));
            }
        }

        if (filter.startDateFrom() != null || filter.startDateTo() != null) {
            Criteria startCriteria = Criteria.where("internshipStartDate");
            if (filter.startDateFrom() != null) {
                startCriteria = startCriteria.gte(filter.startDateFrom());
            }
            if (filter.startDateTo() != null) {
                startCriteria = startCriteria.lte(filter.startDateTo());
            }
            criteriaList.add(startCriteria);
        }

        if (filter.limitDateFrom() != null || filter.limitDateTo() != null) {
            Criteria limitCriteria = Criteria.where("limitApplicationDate");
            if (filter.limitDateFrom() != null) {
                limitCriteria = limitCriteria.gte(filter.limitDateFrom());
            }
            if (filter.limitDateTo() != null) {
                limitCriteria = limitCriteria.lte(filter.limitDateTo());
            }
            criteriaList.add(limitCriteria);
        }

        if (filter.companyId() != null && !filter.companyId().isBlank()) {
            criteriaList.add(Criteria.where("company.$id").is(filter.companyId()));
        }

        Query query = new Query();
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        return mongoTemplate.find(query, OfferEntity.class);
    }
}
