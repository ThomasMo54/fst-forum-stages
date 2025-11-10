package fr.fst.forumstages.backend.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

public record CreateAdminUserDto(
    @NotBlank @Email(message = "Email must be a valid email address")
    String email,

    @NotBlank @Length(min = 8, max = 200, message = "Password must be between 8 and 200 characters long")
    String password
) {}
