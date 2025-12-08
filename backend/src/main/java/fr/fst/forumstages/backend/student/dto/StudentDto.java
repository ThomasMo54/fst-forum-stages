package fr.fst.forumstages.backend.student.dto;

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
        LocalDateTime registrationDate,
        String userId
) {}
