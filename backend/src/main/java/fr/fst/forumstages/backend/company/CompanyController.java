package fr.fst.forumstages.backend.company;

import fr.fst.forumstages.backend.company.annotation.IsAdminOrCompanyOwner;
import fr.fst.forumstages.backend.company.dto.CompanyDto;
import fr.fst.forumstages.backend.company.dto.UpdateCompanyDto;
import fr.fst.forumstages.backend.offer.OfferEntity;
import fr.fst.forumstages.backend.offer.dto.OfferDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/companies")
@Tag(name = "Entreprises", description = "Endpoints pour la gestion des entreprises")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @Operation(summary = "Récupérer une entreprise par son ID", description = "Permet de récupérer les informations d'une entreprise en utilisant son identifiant unique.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Entreprise récupérée avec succès"),
            @ApiResponse(responseCode = "404", description = "Entreprise non trouvée")
    })
    @GetMapping("/{id}")
    public CompanyDto findCompanyById(@PathVariable("id") String id) {
        CompanyEntity companyEntity = companyService.findCompanyById(id);
        return CompanyDto.fromEntity(companyEntity);
    }

    @Operation(summary = "Mettre à jour une entreprise", description = "Permet de mettre à jour les informations d'une entreprise existante.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Entreprise mise à jour avec succès"),
            @ApiResponse(responseCode = "400", description = "Données invalides fournies"),
            @ApiResponse(responseCode = "403", description = "Accès refusé - permissions insuffisantes"),
            @ApiResponse(responseCode = "404", description = "Entreprise non trouvée")
    })
    @IsAdminOrCompanyOwner
    @PutMapping("/{id}")
    public CompanyDto updateCompany(@PathVariable("id") String id, @Valid @RequestBody UpdateCompanyDto updateCompanyDto) {
        CompanyEntity companyEntity = companyService.updateCompany(id, updateCompanyDto);
        return CompanyDto.fromEntity(companyEntity);
    }

    @Operation(summary = "Récupérer toutes les offres d'une entreprise", description = "Permet de récupérer toutes les offres associées à une entreprise spécifique.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Offres récupérées avec succès"),
            @ApiResponse(responseCode = "404", description = "Entreprise non trouvée")
    })
    @GetMapping("/{id}/offers")
    public List<OfferDto> getAllOffers(@PathVariable("id") String companyId) {
        List<OfferEntity> offersEntity = companyService.getCompanyOffers(companyId);
        return offersEntity.stream().map(OfferDto::fromEntity).toList();
    }
}
