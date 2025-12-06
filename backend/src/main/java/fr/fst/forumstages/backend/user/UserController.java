package fr.fst.forumstages.backend.user;

import fr.fst.forumstages.backend.company.dto.CreateCompanyDto;
import fr.fst.forumstages.backend.student.dto.CreateStudentUserDto;
import fr.fst.forumstages.backend.user.annotation.IsAdminOrUserOwner;
import fr.fst.forumstages.backend.user.dto.CreateAdminUserDto;
import fr.fst.forumstages.backend.user.dto.UpdateUserDto;
import fr.fst.forumstages.backend.user.dto.UserDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@Tag(name = "Utilisateurs", description = "Endpoints pour la gestion des utilisateurs")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
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
        return UserDto.fromEntity(userEntity);
    }

    @PostMapping("/student")
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto createStudentUser(@Valid @RequestBody CreateStudentUserDto createStudentUserDto) {
        UserEntity userEntity = userService.createStudentUser(createStudentUserDto);
        return UserDto.fromEntity(userEntity);
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
