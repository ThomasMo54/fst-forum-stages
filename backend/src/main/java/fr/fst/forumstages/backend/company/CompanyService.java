package fr.fst.forumstages.backend.company;

import fr.fst.forumstages.backend.company.dto.CompanyDto;
import fr.fst.forumstages.backend.company.dto.CreateCompanyDto;
import fr.fst.forumstages.backend.company.dto.UpdateCompanyDto;
import fr.fst.forumstages.backend.offer.OfferEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public CompanyEntity createCompany(CreateCompanyDto createCompanyDto) {
        CompanyDto companyDto = new CompanyDto(
                null,
                createCompanyDto.name(),
                createCompanyDto.contactEmail(),
                createCompanyDto.streetAddress(),
                createCompanyDto.city(),
                createCompanyDto.postalCode(),
                createCompanyDto.country(),
                null
        );
        CompanyEntity companyEntity = CompanyEntity.fromDto(companyDto);
        return companyRepository.save(companyEntity);
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
        if (updateCompanyDto.contactEmail() != null) {
            existingCompany.setContactEmail(updateCompanyDto.contactEmail());
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

    public List<OfferEntity> getCompanyOffers(String companyId) {
        CompanyEntity company = findCompanyById(companyId);

        return company.getPublishedOffers();
    }
}
