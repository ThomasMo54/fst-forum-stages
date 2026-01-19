package fr.fst.forumstages.backend.application;

import java.util.List;

import fr.fst.forumstages.backend.offer.annotation.IsAdminOrOfferOwner;
import fr.fst.forumstages.backend.storage.FileStorageService;
import fr.fst.forumstages.backend.student.annotation.IsAdminOrStudentOwner;
import fr.fst.forumstages.backend.user.annotation.IsAdminOrUserOwner;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import fr.fst.forumstages.backend.application.dto.ApplicationDto;
import fr.fst.forumstages.backend.application.dto.CreateApplicationDto;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/applications")
@Tag(name = "Candidature à une offre", description = "Endpoints pour la gestion des candidatures")
public class ApplicationController {
    private final ApplicationService applicationService;
    private final FileStorageService fileStorageService;

    public ApplicationController(ApplicationService applicationService, FileStorageService fileStorageService) {
        this.applicationService = applicationService;
        this.fileStorageService = fileStorageService;
    }

    @Operation(summary = "Créer une nouvelle candidature", description = "Permet de créer une nouvelle candidature à une offre de stage")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Candidature créée avec succès"),
            @ApiResponse(responseCode = "400", description = "Données invalides fournies"),
            @ApiResponse(responseCode = "403", description = "Accès refusé - permissions insuffisantes")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
//    @IsAdminOrStudentOwner
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
//    @IsAdminOrStudentOwner
    @GetMapping("/student/{id}")
    public List<ApplicationDto> getAllApplicationsForStudent(@PathVariable String id) {
        var applications = applicationService.getApplicationsForStudent(id);
        return applications.stream().map(ApplicationDto::fromEntity).toList();
    }

    @Operation(summary = "Récupérer l'URL de téléversement de la lettre de motivation pour une offre", description = "Permet de récupérer l'URL pré-signée pour téléverser la lettre de motivation d'un étudiant à une offre.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "URL de téléversement récupérée avec succès"),
            @ApiResponse(responseCode = "404", description = "Candidature non trouvée")
    })
    @PutMapping("/{id}/coverLetter")
//    @IsAdminOrStudentOwner
    public String uploadCoverLetter(@PathVariable String id){
        try {
            return fileStorageService.getCoverLetterUploadUrl(id + "_cover_letter.pdf");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Operation(summary = "Récupérer l'URL de téléchargement de la lettre de motivation d'un étudiant pour une offre", description = "Permet de récupérer l'URL pré-signée pour télécharger la lettre de motivation d'un étudiant à une offre.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "URL de téléchargement récupérée avec succès"),
            @ApiResponse(responseCode = "404", description = "Candidature non trouvée")
    })
    @GetMapping("/{id}/coverLetter")
//    @IsAdminOrUserOwner
    public String getCoverLetterUrl(@PathVariable String id){
        try {
            return fileStorageService.getCoverLetterDownloadUrl(id + "_cover_letter.pdf");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
