package fr.fst.forumstages.backend.user.dto;

import fr.fst.forumstages.backend.user.UserEntity;
import fr.fst.forumstages.backend.user.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserDto(
    @NotBlank
    String id,

    @NotBlank @Email
    String email,

    @NotBlank
    UserRole role
) {

    public static UserDto fromEntity(UserEntity userEntity) {
        return new UserDto(
                userEntity.getId(),
                userEntity.getEmail(),
                userEntity.getRole()
        );
    }
}
