package fr.fst.forumstages.backend.student;

import fr.fst.forumstages.backend.student.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentEntity getStudentById(String id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Student not found with ID: " + id));
    }

    /**
     * Modifie un étudiant existant
     */
    @Transactional
    public StudentDto updateStudent(String id, UpdateStudentDto requestDto) {
        log.info("Updating student ID: {}", id);

        // Récupération de l'étudiant
        StudentEntity student = studentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Student not found with ID: " + id));

        // Vérification de l'unicité de l'email si modifié
        if (!student.getEmail().equals(requestDto.email())
                && studentRepository.existsByEmail(requestDto.email())) {
            throw new DuplicateKeyException("A student with this email already exists: " + requestDto.email());
        }

        // Vérification de l'unicité du numéro étudiant si modifié
        if (!student.getStudentNumber().equals(requestDto.studentNumber())
                && studentRepository.existsByStudentNumber(requestDto.studentNumber())) {
            throw new DuplicateKeyException("This student number is already in use: " + requestDto.studentNumber());
        }

        // Mise à jour des données
        student.updateFromRequestDto(requestDto);

        // Sauvegarde
        StudentEntity updatedStudent = studentRepository.save(student);
        log.info("Student updated successfully. ID: {}", updatedStudent.getId());

        return updatedStudent.toDto();
    }
}
