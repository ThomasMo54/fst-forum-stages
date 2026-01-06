package fr.fst.forumstages.backend.offer;

import fr.fst.forumstages.backend.offer.dto.CreateOfferDto;
import fr.fst.forumstages.backend.offer.dto.OfferDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.data.domain.Page;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/offers")
@Tag(name = "Offres de stage", description = "Endpoints pour la gestion des offres de stage")
public class OfferController {
    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @Operation(summary = "Créer une nouvelle offre de stage", description = "Permet de créer une nouvelle offre de stage.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Offre de stage créée avec succès"),
            @ApiResponse(responseCode = "400", description = "Données invalides fournies")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN, COMPANY')")
    public OfferDto createOffer(@Valid @RequestBody CreateOfferDto createOfferDto) {
        OfferEntity offerEntity = offerService.createOffer(createOfferDto);
        return OfferDto.fromEntity(offerEntity);
    }

    @Operation(summary = "Récupérer une offre de stage par son ID", description = "Permet de récupérer les informations d'une offre de stage en utilisant son identifiant unique.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Offre de stage récupérée avec succès"),
            @ApiResponse(responseCode = "404", description = "Offre de stage non trouvée")
    })
    @GetMapping("/{offerId}")
    public OfferDto findOfferById(@PathVariable String offerId) {
        OfferEntity offerEntity = offerService.findOfferById(offerId);
        return OfferDto.fromEntity(offerEntity);
    }

    @Operation(summary = "Récupérer toutes les offres de stage", description = "Permet de récupérer toutes les offres de stage disponibles.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Offres de stage récupérées avec succès")
    })
    @GetMapping
    public Page<OfferDto> findAllOffers(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "15") int size) {
        Page<OfferEntity> offers = offerService.getAllOffers(page, size);
        return offers.map(OfferDto::fromEntity);
    }

    @Operation(summary = "Mettre à jour une offre de stage", description = "Permet de mettre à jour les informations d'une offre de stage existante.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Offre de stage mise à jour avec succès"),
            @ApiResponse(responseCode = "400", description = "Données invalides fournies"),
            @ApiResponse(responseCode = "404", description = "Offre de stage non trouvée")
    })
    @PutMapping("/{offerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN, COMPANY')")
    public void updateOffer(@PathVariable String offerId, @Valid @RequestBody CreateOfferDto createOfferDto) {
        offerService.updateOffer(offerId, createOfferDto);
    }

    @Operation(summary = "Supprimer une offre de stage par son ID", description = "Permet de supprimer une offre de stage en utilisant son identifiant unique.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Offre de stage supprimée avec succès"),
            @ApiResponse(responseCode = "404", description = "Offre de stage non trouvée")
    })
    @DeleteMapping("/{offerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN, COMPANY')")
    public void deleteOffer(@PathVariable String offerId) {
        offerService.deleteOfferById(offerId);
    }
}
