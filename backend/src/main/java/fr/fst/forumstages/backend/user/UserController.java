package fr.fst.forumstages.backend.user;

import fr.fst.forumstages.backend.company.dto.CreateCompanyDto;
import fr.fst.forumstages.backend.user.dto.CreateAdminUserDto;
import fr.fst.forumstages.backend.user.dto.UpdateUserDto;
import fr.fst.forumstages.backend.user.dto.UserDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin")
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto createAdminUser(@Valid @RequestBody CreateAdminUserDto createAdminUserDto) {
        UserEntity userEntity = userService.createAdminUser(createAdminUserDto);
        return UserDto.fromEntity(userEntity);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/company")
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto createCompanyUser(@Valid @RequestBody CreateCompanyDto createCompanyDto) {
        UserEntity userEntity = userService.createCompanyUser(createCompanyDto);
        return UserDto.fromEntity(userEntity);
    }

    @PutMapping("/{id}")
    public UserDto updateUser(@PathVariable("id") String id, @Valid @RequestBody UpdateUserDto updateUserDto) {
        UserEntity userEntity = userService.updateUser(id, updateUserDto);
        return UserDto.fromEntity(userEntity);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable("id") String id) {
        userService.deleteUser(id);
    }
}
