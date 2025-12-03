package fr.fst.forumstages.backend.student;

import fr.fst.forumstages.backend.student.dto.*;
import fr.fst.forumstages.backend.student.exception.DuplicateStudentException;
import fr.fst.forumstages.backend.student.exception.StudentNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;


    /**
     * Modifie un étudiant existant
     */
    @Transactional
    public StudentDto updateStudent(String id, StudentRequestDto requestDto) {
        log.info("Mise à jour de l'étudiant ID: {}", id);

        // Récupération de l'étudiant
        StudentEntity student = studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException("Étudiant non trouvé avec l'ID: " + id));

        // Vérification de l'unicité de l'email si modifié
        if (!student.getEmail().equals(requestDto.email())
                && studentRepository.existsByEmail(requestDto.email())) {
            throw new DuplicateStudentException("Un étudiant avec cet email existe déjà: " + requestDto.email());
        }

        // Vérification de l'unicité du numéro étudiant si modifié
        if (!student.getStudentNumber().equals(requestDto.studentNumber())
                && studentRepository.existsByStudentNumber(requestDto.studentNumber())) {
            throw new DuplicateStudentException("Ce numéro étudiant est déjà utilisé: " + requestDto.studentNumber());
        }

        // Mise à jour des données
        student.updateFromRequestDto(requestDto);

        // Sauvegarde
        StudentEntity updatedStudent = studentRepository.save(student);
        log.info("Étudiant mis à jour avec succès. ID: {}", updatedStudent.getId());

        return updatedStudent.toDto();
    }

    public StudentDto findByUserId(String userId) {
        StudentEntity student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new StudentNotFoundException("Étudiant non trouvé avec l'IDUser: " + userId));
        return student.toDto();
    }
}