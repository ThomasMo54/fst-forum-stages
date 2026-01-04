package fr.fst.forumstages.backend.application;

import java.util.List;

import fr.fst.forumstages.backend.offer.annotation.IsAdminOrOfferOwner;
import fr.fst.forumstages.backend.user.annotation.IsAdminOrUserOwner;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import fr.fst.forumstages.backend.application.dto.ApplicationDto;
import fr.fst.forumstages.backend.application.dto.CreateApplicationDto;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/applications")
@Tag(name = "Candidature à une offre", description = "Endpoints pour la gestion des candidatures")
public class ApplicationController {
    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @Operation(summary = "Créer une nouvelle candidature", description = "Permet de créer une nouvelle candidature à une offre de stage")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Candidature créée avec succès"),
            @ApiResponse(responseCode = "400", description = "Données invalides fournies"),
            @ApiResponse(responseCode = "403", description = "Accès refusé - permissions insuffisantes")
    })
//    @IsAdminOrUserOwner
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationDto createApplication(@Valid @RequestBody CreateApplicationDto createApplicationDto) {

        var applicationEntity = this.applicationService.createApplication(createApplicationDto);
        return ApplicationDto.fromEntity(applicationEntity);
    }

    @Operation(summary = "Récupérer toutes les candidatures d'une offres", description = "Permet de récupérer toutes les candidatures d'une offre d'id fournies")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Candidatures récupérées avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé - permissions insuffisantes"),
            @ApiResponse(responseCode = "404", description = "Candidatures non trouvées")
    })
//    @IsAdminOrOfferOwner
    @GetMapping("/offer/{offerId}")
    public List<ApplicationDto> getAllApplicationsForOffer(@PathVariable String offerId) {
        var applications = applicationService.getApplicationsForOffer(offerId);
        return applications.stream().map(ApplicationDto::fromEntity).toList();
    }

    @Operation(summary = "Récupérer toutes les candidatures d'un étudiant", description = "Permet de récupérer toutes les candidatures d'un étudiant d'id fournies")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Candidatures récupérées avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé - permissions insuffisantes"),
            @ApiResponse(responseCode = "404", description = "Candidatures non trouvées")
    })
//    @IsAdminOrUserOwner
    @GetMapping("/student/{studentId}")
    public List<ApplicationDto> getAllApplicationsForStudent(@PathVariable String studentId) {
        var applications = applicationService.getApplicationsForStudent(studentId);
        return applications.stream().map(ApplicationDto::fromEntity).toList();
    }
}
