package fr.fst.forumstages.backend.user;

import fr.fst.forumstages.backend.company.dto.CreateCompanyDto;
import fr.fst.forumstages.backend.email.EmailService;
import fr.fst.forumstages.backend.student.dto.CreateStudentUserDto;
import fr.fst.forumstages.backend.user.annotation.IsAdminOrUserOwner;
import fr.fst.forumstages.backend.user.dto.CreateAdminUserDto;
import fr.fst.forumstages.backend.user.dto.RefreshVerificationCodeDto;
import fr.fst.forumstages.backend.user.dto.UpdateUserDto;
import fr.fst.forumstages.backend.user.dto.UserDto;
import fr.fst.forumstages.backend.user.dto.VerifyRequestDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.NoSuchElementException;

@RestController
@RequestMapping("/users")
@Tag(name = "Utilisateurs", description = "Endpoints pour la gestion des utilisateurs")
public class UserController {

    private final UserService userService;
    private final EmailService emailService;

    public UserController(UserService userService, EmailService emailService) {
        this.userService = userService;
        this.emailService = emailService;
    }

    @Operation(summary = "Créer un utilisateur administrateur", description = "Permet de créer un nouvel utilisateur avec le rôle d'administrateur.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Utilisateur administrateur créé avec succès"),
            @ApiResponse(responseCode = "400", description = "Données invalides fournies"),
            @ApiResponse(responseCode = "403", description = "Accès refusé - permissions insuffisantes")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin")
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto createAdminUser(@Valid @RequestBody CreateAdminUserDto createAdminUserDto) {
        UserEntity userEntity = userService.createAdminUser(createAdminUserDto);
        emailService.sendVerificationEmail(userEntity.getEmail(), userEntity.getVerificationCode());
        return UserDto.fromEntity(userEntity);
    }

    @Operation(summary = "Créer un utilisateur entreprise", description = "Permet de créer un nouvel utilisateur avec le rôle d'entreprise.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Utilisateur entreprise créé avec succès"),
            @ApiResponse(responseCode = "400", description = "Données invalides fournies"),
            @ApiResponse(responseCode = "403", description = "Accès refusé - permissions insuffisantes")
    })
    @PostMapping("/company")
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto createCompanyUser(@Valid @RequestBody CreateCompanyDto createCompanyDto) {
        UserEntity userEntity = userService.createCompanyUser(createCompanyDto);
        emailService.sendVerificationEmail(userEntity.getEmail(), userEntity.getVerificationCode());
        return UserDto.fromEntity(userEntity);
    }

    @PostMapping("/student")
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto createStudentUser(@Valid @RequestBody CreateStudentUserDto createStudentUserDto) {
        UserEntity userEntity = userService.createStudentUser(createStudentUserDto);
        return UserDto.fromEntity(userEntity);
    }

    @Operation(summary = "Vérifier un utilisateur", description = "Permet de vérifier un utilisateur à l'aide d'un code de vérification.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Utilisateur vérifié avec succès (si déjà vérifié ou inexistant, aucune action nécessaire)"),
            @ApiResponse(responseCode = "400", description = "Code de vérification invalide ou expiré"),
    })
    @PostMapping("/verify")
    public ResponseEntity<?> verifyUser(@Valid @RequestBody VerifyRequestDto verifyRequestDto) {
        try {
            userService.verifyUser(verifyRequestDto.email(), verifyRequestDto.verificationCode());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IllegalStateException | NoSuchElementException e) {
            return ResponseEntity.ok().build();
        }
    }

    @Operation(summary = "Rafraîchir le code de vérification", description = "Permet de générer un nouveau code de vérification pour un utilisateur.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Code de vérification rafraîchi avec succès (si utilisateur inexistant ou déjà vérifié, aucune action nécessaire)"),
            @ApiResponse(responseCode = "400", description = "Requête de rafraîchissement invalide"),
            @ApiResponse(responseCode = "429", description = "Trop de demandes de rafraîchissement, veuillez réessayer plus tard")
    })
    @PostMapping("/refresh-verification")
    public ResponseEntity<?> refreshVerificationCode(@Valid @RequestBody RefreshVerificationCodeDto refreshVerificationCodeDto) {
        try {
            String code = userService.refreshVerificationCode(refreshVerificationCodeDto.email());
            emailService.sendVerificationEmail(refreshVerificationCodeDto.email(), code);
        } catch (IllegalStateException | NoSuchElementException ignored) {}
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Mettre à jour un utilisateur", description = "Permet de mettre à jour les informations d'un utilisateur existant.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Utilisateur mis à jour avec succès"),
            @ApiResponse(responseCode = "400", description = "Données invalides fournies"),
            @ApiResponse(responseCode = "403", description = "Accès refusé - permissions insuffisantes"),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    @IsAdminOrUserOwner
    @PutMapping("/{id}")
    public UserDto updateUser(@PathVariable("id") String id, @Valid @RequestBody UpdateUserDto updateUserDto) {
        return UserDto.fromEntity(userService.updateUser(id, updateUserDto));
    }

    @Operation(summary = "Supprimer un utilisateur", description = "Permet de supprimer un utilisateur existant.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Utilisateur supprimé avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé - permissions insuffisantes"),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    @IsAdminOrUserOwner
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable("id") String id) {
        userService.deleteUser(id);
    }
}
