package fr.fst.forumstages.backend.student.dto;

import jakarta.validation.constraints.*;

import java.util.List;

/**
 * DTO pour créer un utilisateur étudiant complet (User + Student)
 */
public record CreateStudentUserDto(
        // Informations utilisateur
        @NotBlank(message = "L'email est obligatoire")
        @Email(message = "Format d'email invalide")
        String email,

        @NotBlank(message = "Le mot de passe est obligatoire")
        @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
        String password,

        // Informations étudiant
        @NotBlank(message = "Le prénom est obligatoire")
        @Size(min = 2, max = 50, message = "Le prénom doit contenir entre 2 et 50 caractères")
        String firstName,

        @NotBlank(message = "Le nom est obligatoire")
        @Size(min = 2, max = 50, message = "Le nom doit contenir entre 2 et 50 caractères")
        String lastName,

        @NotBlank(message = "Le numéro étudiant est obligatoire")
        @Pattern(regexp = "^[A-Z0-9]{6,20}$", message = "Numéro étudiant invalide (6-20 caractères alphanumériques)")
        String studentNumber,

        @Pattern(regexp = "^(\\+33|0)[1-9][0-9]{8}$", message = "Numéro de téléphone invalide")
        String phone,

        @NotBlank(message = "Le niveau d'études est obligatoire")
        String educationLevel,

        @NotBlank(message = "La filière est obligatoire")
        String fieldOfStudy,

        String specialization,

        @NotNull(message = "L'année d'étude est obligatoire")
        @Min(value = 1, message = "L'année d'étude doit être au moins 1")
        @Max(value = 13, message = "L'année d'étude ne peut dépasser 13")
        Integer yearOfStudy,

        List<String> skills
) {
}