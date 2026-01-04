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
    public static StudentDto fromEntity(StudentEntity studentEntity){
        return new StudentDto(
                studentEntity.getId(),
                studentEntity.getFirstName(),
                studentEntity.getLastName(),
                studentEntity.getEmail(),
                studentEntity.getStudentNumber(),
                studentEntity.getPhone(),
                studentEntity.getEducationLevel(),
                studentEntity.getFieldOfStudy(),
                studentEntity.getSpecialization(),
                studentEntity.getYearOfStudy(),
                studentEntity.getSkills(),
                studentEntity.getCvPath(),
                studentEntity.getRegistrationDate()
        );
    }
}
