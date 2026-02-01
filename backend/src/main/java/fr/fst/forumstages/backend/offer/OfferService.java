package fr.fst.forumstages.backend.offer;

import fr.fst.forumstages.backend.company.CompanyEntity;
import fr.fst.forumstages.backend.company.CompanyRepository;
import fr.fst.forumstages.backend.offer.dto.CreateOfferDto;
import fr.fst.forumstages.backend.offer.dto.OfferDto;
import fr.fst.forumstages.backend.offer.dto.OfferSearchFilter;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class OfferService {
    private final OfferRepository offerRepository;
    private final OfferSearchRepository offerSearchRepository;

    private final CompanyRepository companyRepository;

    public OfferService(OfferRepository offerRepository, OfferSearchRepository offerSearchRepository, CompanyRepository companyRepository) {
        this.offerRepository = offerRepository;
        this.offerSearchRepository = offerSearchRepository;
        this.companyRepository = companyRepository;
    }

    public OfferEntity createOffer(CreateOfferDto createOfferDto) {
        CompanyEntity companyEntity = companyRepository.findById(createOfferDto.companyId())
                .orElseThrow(
                        () -> new NoSuchElementException(("Company with id " + createOfferDto.companyId() + " not found"))
        );

        OfferDto offerDto = new OfferDto(
                null,
                createOfferDto.title(),
                createOfferDto.description(),
                (createOfferDto.tags() != null) ? createOfferDto.tags() : null,
                (createOfferDto.salary() != null) ? createOfferDto.salary() : null,
                null,
                (createOfferDto.internshipStartDate() != null) ? createOfferDto.internshipStartDate() : null,
                (createOfferDto.internshipDuration() != null) ? createOfferDto.internshipDuration() : null,
                (createOfferDto.limitApplicationDate() != null) ? createOfferDto.limitApplicationDate() : null,
                (createOfferDto.studyLevel() != null) ? createOfferDto.studyLevel() : null,
                (createOfferDto.remoteWorkPolicy() != null) ? createOfferDto.remoteWorkPolicy() : null,
                createOfferDto.companyId()
        );

        OfferEntity offerEntity = OfferEntity.fromDto(offerDto);
        offerEntity.setCompany(companyEntity);

        OfferEntity finalOffer = offerRepository.save(offerEntity);

        companyEntity.getPublishedOffers().add(finalOffer);
        companyRepository.save(companyEntity);

        return finalOffer;
    }

    public OfferEntity findOfferById(String id) {
        return offerRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(("Offer with id " + id + " not found")));
    }

    public List<OfferEntity> getAllOffers() {
        return offerRepository.findAll();
    }

    public List<OfferEntity> searchOffers(OfferSearchFilter filter) {
        return offerSearchRepository.findByFilter(filter);
    }
}
