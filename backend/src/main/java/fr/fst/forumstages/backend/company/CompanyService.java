package fr.fst.forumstages.backend.company;

import fr.fst.forumstages.backend.company.dto.UpdateCompanyDto;
import fr.fst.forumstages.backend.offer.OfferEntity;
import fr.fst.forumstages.backend.offer.OfferRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    private final OfferRepository offerRepository;

    public CompanyService(CompanyRepository companyRepository, OfferRepository offerRepository) {
        this.companyRepository = companyRepository;
        this.offerRepository = offerRepository;
    }

    public CompanyEntity findCompanyById(String id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Company with id " + id + " not found"));
    }

    public CompanyEntity updateCompany(String id, UpdateCompanyDto updateCompanyDto) {
        CompanyEntity existingCompany = findCompanyById(id);
        if (updateCompanyDto.name() != null) {
            existingCompany.setName(updateCompanyDto.name());
        }

        if (updateCompanyDto.streetAddress() != null) {
            existingCompany.setStreetAddress(updateCompanyDto.streetAddress());
        }
        if (updateCompanyDto.city() != null) {
            existingCompany.setCity(updateCompanyDto.city());
        }
        if (updateCompanyDto.postalCode() != null) {
            existingCompany.setPostalCode(updateCompanyDto.postalCode());
        }
        if (updateCompanyDto.country() != null) {
            existingCompany.setCountry(updateCompanyDto.country());
        }
        return companyRepository.save(existingCompany);
    }

    public void deleteCompany(String id) {
        CompanyEntity existingCompany = findCompanyById(id);
        companyRepository.delete(existingCompany);
    }

    public Page<OfferEntity> getCompanyOffers(String companyId, int page, int size) {
        CompanyEntity company = findCompanyById(companyId);
        Pageable pageable = PageRequest.of(page, size, Sort.by("creationDate").descending());

        return this.offerRepository.findOfferEntitiesByCompany_Id(companyId, pageable);
    }
}
