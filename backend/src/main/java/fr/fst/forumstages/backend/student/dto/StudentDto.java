package fr.fst.forumstages.backend.student.dto;

import fr.fst.forumstages.backend.student.StudentEntity;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de réponse complet
 */
public record StudentDto(
        String id,
        String firstName,
        String lastName,
        String email,
        String studentNumber,
        String phone,
        String educationLevel,
        String fieldOfStudy,
        String specialization,
        Integer yearOfStudy,
        List<String> skills,
        String cvPath,
        LocalDateTime registrationDate
) {

    public static StudentDto fromEntity(StudentEntity entity) {
        return new StudentDto(
                entity.getId(),
                entity.getFirstName(),
                entity.getLastName(),
                entity.getEmail(),
                entity.getStudentNumber(),
                entity.getPhone(),
                entity.getEducationLevel(),
                entity.getFieldOfStudy(),
                entity.getSpecialization(),
                entity.getYearOfStudy(),
                entity.getSkills(),
                entity.getCvPath(),
                entity.getRegistrationDate()
        );
    }
}
