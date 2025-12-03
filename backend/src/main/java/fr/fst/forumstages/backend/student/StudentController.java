package fr.fst.forumstages.backend.student;

import fr.fst.forumstages.backend.student.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    /**
     * PUT /students/{id}
     * Modifier un étudiant existant
     */
    @PutMapping("/{id}")
    public StudentDto updateStudent(
            @PathVariable String id,
            @Valid @RequestBody StudentRequestDto requestDto) {

        log.info("Requête PUT /students/{} - Mise à jour d'un étudiant", id);

        return studentService.updateStudent(id, requestDto);
    }

    @GetMapping("/by-user/{userId}")
    public StudentDto getStudentByUserId(@PathVariable String userId) {
        log.info("Récupération de l'étudiant pour l'utilisateur {}", userId);
        return studentService.findByUserId(userId);
    }

}
