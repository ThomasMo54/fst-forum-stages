package fr.fst.forumstages.backend.student;

import fr.fst.forumstages.backend.config.ApiResponse;
import fr.fst.forumstages.backend.student.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@Slf4j
@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    /**
     * POST /api/students
     * Créer un nouvel étudiant
     */
    @PostMapping
    public ResponseEntity<ApiResponse<StudentDto>> addStudent(
            @Valid @RequestBody StudentRequestDto requestDto) {

        log.info("Requête POST /students - Création d'un étudiant");

        StudentDto student = studentService.addStudent(requestDto);

        ApiResponse<StudentDto> response = ApiResponse.success(
                "Étudiant créé avec succès",
                student
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/students/{id}
     * Modifier un étudiant existant
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDto>> updateStudent(
            @PathVariable String id,
            @Valid @RequestBody StudentRequestDto requestDto) {

        log.info("Requête PUT /students/{} - Mise à jour d'un étudiant", id);

        StudentDto student = studentService.updateStudent(id, requestDto);

        ApiResponse<StudentDto> response = ApiResponse.success(
                "Étudiant modifié avec succès",
                student
        );

        return ResponseEntity.ok(response);
    }
}