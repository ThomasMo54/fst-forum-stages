package fr.fst.forumstages.backend.offer;

import fr.fst.forumstages.backend.company.CompanyEntity;
import fr.fst.forumstages.backend.company.CompanyRepository;
import fr.fst.forumstages.backend.offer.dto.CreateOfferDto;
import fr.fst.forumstages.backend.offer.dto.OfferDto;
import org.springframework.stereotype.Service;

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
                        () -> new NoSuchElementException(("Company with id " + createOfferDto.companyId() + " not found"))
        );

        OfferDto offerDto = new OfferDto(
                null,
                createOfferDto.title(),
                createOfferDto.description(),
                null
        );

        OfferEntity offerEntity = OfferEntity.fromDto(offerDto);
        offerEntity.setCompany(companyEntity);

        OfferEntity finalOffer = offerRepository.save(offerEntity);

        companyEntity.addOffer(finalOffer);
        companyRepository.save(companyEntity);

        return finalOffer;
    }

    public OfferEntity findOfferById(String id) {
        return offerRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(("Offer with id " + id + " not found")));
    }
}
