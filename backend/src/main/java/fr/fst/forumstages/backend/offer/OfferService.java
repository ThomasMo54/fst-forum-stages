package fr.fst.forumstages.backend.offer;

import fr.fst.forumstages.backend.company.CompanyEntity;
import fr.fst.forumstages.backend.company.CompanyRepository;
import fr.fst.forumstages.backend.offer.dto.CreateOfferDto;
import fr.fst.forumstages.backend.offer.dto.OfferDto;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class OfferService {
    private final OfferRepository offerRepository;

    private final CompanyRepository companyRepository;

    public OfferService(OfferRepository offerRepository, CompanyRepository companyRepository) {
        this.offerRepository = offerRepository;
        this.companyRepository = companyRepository;
    }

    public OfferEntity createOffer(CreateOfferDto createOfferDto) {
        CompanyEntity companyEntity = companyRepository.findById(createOfferDto.companyId())
                .orElseThrow(
                        () -> new NoSuchElementException(
                                ("Company with id " + createOfferDto.companyId() + " not found")));

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
                createOfferDto.companyId());

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

    public void updateOffer(String offerId, CreateOfferDto createOfferDto) {
        OfferEntity existingOffer = offerRepository.findById(offerId)
                .orElseThrow(() -> new NoSuchElementException(("Offer with id " + offerId + " not found")));

        CompanyEntity companyEntity = companyRepository.findById(createOfferDto.companyId())
                .orElseThrow(
                        () -> new NoSuchElementException(
                                ("Company with id " + createOfferDto.companyId() + " not found")));
        existingOffer.setCompany(companyEntity);
        existingOffer.setTitle(createOfferDto.title());
        existingOffer.setDescription(createOfferDto.description());
        existingOffer.setTags(createOfferDto.tags());
        existingOffer.setSalary(createOfferDto.salary());
        existingOffer.setInternshipStartDate(createOfferDto.internshipStartDate());
        existingOffer.setInternshipDuration(createOfferDto.internshipDuration());
        existingOffer.setLimitApplicationDate(createOfferDto.limitApplicationDate());
        existingOffer.setStudyLevel(createOfferDto.studyLevel());
        existingOffer.setRemoteWorkPolicy(createOfferDto.remoteWorkPolicy());

        offerRepository.save(existingOffer);
    }

    public void deleteOfferById(String id) {
        if (this.offerRepository.existsById(id)) {
            this.offerRepository.deleteById(id);
        } else {
            throw new NoSuchElementException(("Offer with id " + id + " not found"));
        }
    }
}
