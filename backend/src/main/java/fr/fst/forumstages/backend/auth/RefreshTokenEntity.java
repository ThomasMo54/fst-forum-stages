package fr.fst.forumstages.backend.auth;

import fr.fst.forumstages.backend.user.UserEntity;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "refresh_tokens")
public class RefreshTokenEntity {

    @Id
    private String id;

    @DBRef
    private UserEntity user;

    private String token;

    private Instant expiration;
}
