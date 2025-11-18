package fr.fst.forumstages.backend.offer;

import fr.fst.forumstages.backend.offer.dto.CreateOfferDto;
import fr.fst.forumstages.backend.offer.dto.OfferDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/offers")
public class OfferController {
    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OfferDto createOffer(@Valid @RequestBody CreateOfferDto createOfferDto) {
        OfferEntity offerEntity = offerService.createOffer(createOfferDto);
        return OfferDto.fromEntity(offerEntity);
    }

    @GetMapping("/{offerId}")
    public OfferDto findOfferById(@PathVariable String offerId) {
        OfferEntity offerEntity = offerService.findOfferById(offerId);
        return OfferDto.fromEntity(offerEntity);
    }

    @GetMapping
    public List<OfferDto> findAllOffers() {
        List<OfferEntity> offers = offerService.getAllOffers();
        return offers.stream().map(OfferDto::fromEntity).toList();
    }
}
