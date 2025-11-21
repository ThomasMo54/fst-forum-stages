package fr.fst.forumstages.backend.student.exception;

/**
 * Exception levée en cas de doublon (email ou numéro étudiant)
 */
public class DuplicateStudentException extends RuntimeException {
    public DuplicateStudentException(String message) {
        super(message);
    }
}