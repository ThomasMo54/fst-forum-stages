package fr.fst.forumstages.backend.offer;

import fr.fst.forumstages.backend.application.ApplicationEntity;
import fr.fst.forumstages.backend.application.ApplicationService;
import fr.fst.forumstages.backend.company.CompanyEntity;
import fr.fst.forumstages.backend.company.CompanyRepository;
import fr.fst.forumstages.backend.offer.dto.CreateOfferDto;
import fr.fst.forumstages.backend.offer.dto.OfferDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
public class OfferService {
    private final OfferRepository offerRepository;

    private final CompanyRepository companyRepository;

    private final ApplicationService applicationService;

    public OfferService(OfferRepository offerRepository, CompanyRepository companyRepository, ApplicationService applicationService) {
        this.offerRepository = offerRepository;
        this.companyRepository = companyRepository;
        this.applicationService = applicationService;
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
                createOfferDto.companyId(),
                true);

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

    public Page<OfferEntity> getAllOffers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("creationDate").descending());
        return offerRepository.findByOfferOpenTrue(pageable);
    }

    public Page<OfferEntity> getAllOffers(
            int page,
            int size,
            String keyword,
            String city,
            String studyLevel,
            String remoteWorkPolicy,
            String duration
    ) {
        boolean hasFilters =
                isNotBlank(keyword) ||
                isNotBlank(city) ||
                isNotBlank(studyLevel) ||
                isNotBlank(remoteWorkPolicy) ||
                isNotBlank(duration);

        if (!hasFilters) {
            return getAllOffers(page, size);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("creationDate").descending());
        List<OfferEntity> offers = offerRepository.findByOfferOpenTrue(Sort.by("creationDate").descending());

        String keywordFilter = normalize(keyword);
        String cityFilter = normalize(city);
        String studyLevelFilter = normalize(studyLevel);
        String remoteWorkPolicyFilter = normalize(remoteWorkPolicy);
        String durationFilter = normalize(duration);

        List<OfferEntity> filteredOffers = offers.stream()
                .filter(offer -> {
                    if (keywordFilter == null) return true;

                    boolean inTitle = containsIgnoreCase(offer.getTitle(), keywordFilter);
                    boolean inDescription = containsIgnoreCase(offer.getDescription(), keywordFilter);
                    boolean inTags = offer.getTags() != null &&
                            offer.getTags().stream().anyMatch(tag -> containsIgnoreCase(tag, keywordFilter));
                    boolean inCompanyName = offer.getCompany() != null &&
                            containsIgnoreCase(offer.getCompany().getName(), keywordFilter);

                    return inTitle || inDescription || inTags || inCompanyName;
                })
                .filter(offer -> cityFilter == null ||
                        (offer.getCompany() != null && containsIgnoreCase(offer.getCompany().getCity(), cityFilter)))
                .filter(offer -> studyLevelFilter == null || containsIgnoreCase(offer.getStudyLevel(), studyLevelFilter))
                .filter(offer -> remoteWorkPolicyFilter == null || containsIgnoreCase(offer.getRemoteWorkPolicy(), remoteWorkPolicyFilter))
                .filter(offer -> durationFilter == null || containsIgnoreCase(offer.getInternshipDuration(), durationFilter))
                .toList();

        int total = filteredOffers.size();
        int fromIndex = Math.min(page * size, total);
        int toIndex = Math.min(fromIndex + size, total);

        return new PageImpl<>(filteredOffers.subList(fromIndex, toIndex), pageable, total);
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
        if (offerRepository.existsById(id)) {
            var applications = applicationService.getApplicationsForOffer(id);

            for (ApplicationEntity applicationEntity : applications) {
                applicationService.deleteApplication(applicationEntity.getId());
            }

            this.offerRepository.deleteById(id);
        }else {
            throw new NoSuchElementException(("Offer with id " + id + " not found"));
        }
    }

    public OfferEntity changeOfferStatus(String offerId) {
        OfferEntity existingOffer = offerRepository.findById(offerId)
                .orElseThrow(() -> new NoSuchElementException(("Offer with id " + offerId + " not found")));

        existingOffer.setOfferOpen(!existingOffer.isOfferOpen());
        return offerRepository.save(existingOffer);
    }

    private static boolean isNotBlank(String value) {
        return value != null && !value.isBlank();
    }

    private static String normalize(String value) {
        if (!isNotBlank(value)) {
            return null;
        }
        return value.trim().toLowerCase();
    }

    private static boolean containsIgnoreCase(String source, String needle) {
        if (source == null || needle == null) {
            return false;
        }
        return source.toLowerCase().contains(needle);
    }
}
