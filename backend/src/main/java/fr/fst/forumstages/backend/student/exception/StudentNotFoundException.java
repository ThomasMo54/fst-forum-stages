package fr.fst.forumstages.backend.student.exception;

/**
 * Exception levée quand un étudiant n'est pas trouvé
 */
public class StudentNotFoundException extends RuntimeException {
    public StudentNotFoundException(String message) {
        super(message);
    }
}