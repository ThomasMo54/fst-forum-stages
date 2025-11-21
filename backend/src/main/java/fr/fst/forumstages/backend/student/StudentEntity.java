package fr.fst.forumstages.backend.student;

import fr.fst.forumstages.backend.student.dto.StudentDto;
import fr.fst.forumstages.backend.student.dto.StudentRequestDto;
import fr.fst.forumstages.backend.student.enums.AccountStatus;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "students")
public class StudentEntity {

    @Id
    private String id;

    private String firstName;

    private String lastName;

    @Indexed(unique = true)
    private String email;

    @Indexed(unique = true)
    private String studentNumber;

    private String phone;

    private String educationLevel;

    private String fieldOfStudy;

    private String specialization;

    private Integer yearOfStudy;

    private List<String> skills = new ArrayList<>();

    private String cvPath;

    private AccountStatus status = AccountStatus.PENDING;

    private LocalDateTime registrationDate = LocalDateTime.now();

    private String userId; // Référence vers l'utilisateur (User)

    // TODO : Liste des candidatures

    /**
     * Crée une entité Student à partir d'un DTO de requête
     */
    public static StudentEntity fromRequestDto(StudentRequestDto dto) {
        StudentEntity student = new StudentEntity();
        student.firstName = dto.firstName();
        student.lastName = dto.lastName();
        student.email = dto.email();
        student.studentNumber = dto.studentNumber();
        student.phone = dto.phone();
        student.educationLevel = dto.educationLevel();
        student.fieldOfStudy = dto.fieldOfStudy();
        student.specialization = dto.specialization();
        student.yearOfStudy = dto.yearOfStudy();
        student.skills = dto.skills() != null ? new ArrayList<>(dto.skills()) : new ArrayList<>();
        student.status = AccountStatus.PENDING;
        student.registrationDate = LocalDateTime.now();
        return student;
    }

    /**
     * Met à jour l'entité avec les données du DTO
     */
    public void updateFromRequestDto(StudentRequestDto dto) {
        this.firstName = dto.firstName();
        this.lastName = dto.lastName();
        this.email = dto.email();
        this.studentNumber = dto.studentNumber();
        this.phone = dto.phone();
        this.educationLevel = dto.educationLevel();
        this.fieldOfStudy = dto.fieldOfStudy();
        this.specialization = dto.specialization();
        this.yearOfStudy = dto.yearOfStudy();
        this.skills = dto.skills() != null ? new ArrayList<>(dto.skills()) : new ArrayList<>();
    }

    /**
     * Convertit l'entité en DTO
     */
    public StudentDto toDto() {
        return new StudentDto(
                this.id,
                this.firstName,
                this.lastName,
                this.email,
                this.studentNumber,
                this.phone,
                this.educationLevel,
                this.fieldOfStudy,
                this.specialization,
                this.yearOfStudy,
                this.skills,
                this.cvPath,
                this.status,
                this.registrationDate,
                this.userId
        );
    }

    /**
     * Valide le compte de l'étudiant
     */
    public void validateAccount() {
        this.status = AccountStatus.VALIDATED;
    }

    /**
     * Suspend le compte de l'étudiant
     */
    public void suspendAccount() {
        this.status = AccountStatus.SUSPENDED;
    }

    /**
     * Rejette le compte de l'étudiant
     */
    public void rejectAccount() {
        this.status = AccountStatus.REJECTED;
    }

    /**
     * Obtient le nom complet
     */
    public String getFullName() {
        return firstName + " " + lastName;
    }
}