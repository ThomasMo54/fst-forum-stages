package fr.fst.forumstages.backend.company;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;

public interface CompanyRepository extends MongoRepository<CompanyEntity, String> {

    Collection<CompanyEntity> findByCity(String city);

    Collection<CompanyEntity> findByPostalCode(String postalCode);

    Collection<CompanyEntity> findByCountry(String country);
}
