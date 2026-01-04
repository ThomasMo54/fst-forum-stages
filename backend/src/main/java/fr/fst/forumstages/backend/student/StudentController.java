package fr.fst.forumstages.backend.student;

import fr.fst.forumstages.backend.student.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
            @Valid @RequestBody UpdateStudentDto requestDto) {
        return studentService.updateStudent(id, requestDto);
    }

}
