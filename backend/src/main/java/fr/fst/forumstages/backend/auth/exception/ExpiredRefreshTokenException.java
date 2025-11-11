package fr.fst.forumstages.backend.auth.exception;

public class ExpiredRefreshTokenException extends RuntimeException {

    public ExpiredRefreshTokenException(String message) {
        super(message);
    }
}
