package fr.fst.forumstages.backend.student;

import fr.fst.forumstages.backend.storage.FileStorageService;
import fr.fst.forumstages.backend.student.annotation.IsAdminOrStudentOwner;
import fr.fst.forumstages.backend.student.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/students")
public class StudentController {

    private final StudentService studentService;
    private final FileStorageService fileStorageService;

    public StudentController(StudentService studentService, FileStorageService fileStorageService) {
        this.studentService = studentService;
        this.fileStorageService = fileStorageService;
    }

    @Operation(summary = "Récupérer un étudiant par son ID", description = "Permet de récupérer les informations d'un étudiant en utilisant son identifiant unique.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Étudiant récupéré avec succès"),
            @ApiResponse(responseCode = "404", description = "Étudiant non trouvé")
    })
    @GetMapping("/{id}")
    public StudentDto getStudentById(@PathVariable String id) {
        StudentEntity studentEntity = studentService.getStudentById(id);
        return StudentDto.fromEntity(studentEntity);
    }

    @Operation(summary = "Récupérer l'URL de téléchargement du CV d'un étudiant", description = "Permet de récupérer l'URL pré-signée pour télécharger le CV d'un étudiant.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "URL de téléchargement récupérée avec succès"),
            @ApiResponse(responseCode = "404", description = "Étudiant ou CV non trouvé")
    })
    @GetMapping("/{id}/resume")
    public String getResumeUrl(@PathVariable String id) {
        try {
            return fileStorageService.getResumeDownloadUrl(id + "_resume.pdf");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Operation(summary = "Mettre à jour un étudiant", description = "Permet de mettre à jour les informations d'un étudiant existant.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Étudiant mis à jour avec succès"),
            @ApiResponse(responseCode = "400", description = "Données invalides fournies"),
            @ApiResponse(responseCode = "404", description = "Étudiant non trouvé")
    })
    @PutMapping("/{id}")
    @IsAdminOrStudentOwner
    public StudentDto updateStudent(
            @PathVariable String id,
            @Valid @RequestBody UpdateStudentDto requestDto) {
        return studentService.updateStudent(id, requestDto);
    }

    @Operation(summary = "Récupérer l'URL de téléversement du CV d'un étudiant", description = "Permet de récupérer l'URL pré-signée pour téléverser le CV d'un étudiant.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "URL de téléversement récupérée avec succès"),
            @ApiResponse(responseCode = "404", description = "Étudiant non trouvé")
    })
    @PutMapping("/{id}/resume")
    @IsAdminOrStudentOwner
    public String uploadResume(@PathVariable String id) {
        try {
            return fileStorageService.getResumeUploadUrl(id + "_resume.pdf");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
