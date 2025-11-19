package fr.fst.forumstages.backend.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.fst.forumstages.backend.company.dto.CreateCompanyDto;
import fr.fst.forumstages.backend.user.dto.CreateAdminUserDto;
import fr.fst.forumstages.backend.user.dto.UpdateUserDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
public class UserControllerTests {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @MockitoBean(name = "userSecurity")
    private UserSecurity userSecurity;

    @Test
    @WithMockUser(roles = "ADMIN")
    public void createAdminUser_success() throws Exception {
        CreateAdminUserDto createAdminUserDto = new CreateAdminUserDto(
                "a@b.fr",
                "12345678"
        );
        UserEntity createdUser = new UserEntity();
        createdUser.setId("123");
        createdUser.setEmail("a@b.fr");

        when(userService.createAdminUser(any(CreateAdminUserDto.class))).thenReturn(createdUser);

        mockMvc.perform(post("/users/admin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createAdminUserDto))
                .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("123"))
                .andExpect(jsonPath("$.email").value("a@b.fr"));
    }

    @Test
    public void createAdminUser_unauthorized() throws Exception {
        mockMvc.perform(post("/users/admin")
                .contentType(MediaType.APPLICATION_JSON)
                .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    public void createAdminUser_forbidden() throws Exception {
        CreateAdminUserDto createAdminUserDto = new CreateAdminUserDto(
                "a@b.fr",
                "12345678"
        );
        mockMvc.perform(post("/users/admin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createAdminUserDto))
                .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void createCompanyUser_success() throws Exception {
        CreateCompanyDto createCompanyDto = new CreateCompanyDto(
                "a@b.fr",
                "12345678",
                "Test Company",
                "c@d.fr",
                null,
                null,
                null,
                null
        );
        UserEntity createdUser = new UserEntity();
        createdUser.setId("123");
        createdUser.setEmail("a@b.fr");

        when(userService.createCompanyUser(any(CreateCompanyDto.class))).thenReturn(createdUser);

        mockMvc.perform(post("/users/company")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createCompanyDto))
                .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("123"))
                .andExpect(jsonPath("$.email").value("a@b.fr"));
    }

    @Test
    public void createCompanyUser_unauthorized() throws Exception {
        mockMvc.perform(post("/users/company")
                .contentType(MediaType.APPLICATION_JSON)
                .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    public void createCompanyUser_forbidden() throws Exception {
        CreateCompanyDto createCompanyDto = new CreateCompanyDto(
                "a@b.fr",
                "12345678",
                "Test Company",
                "c@d.fr",
                null,
                null,
                null,
                null
        );
        mockMvc.perform(post("/users/company")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createCompanyDto))
                .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void updateUser_admin_success() throws Exception {
        String userId = "123";
        UpdateUserDto updateUserDto = new UpdateUserDto(
                "a@b.fr",
                "newPassword"
        );
        UserEntity updatedUser = new UserEntity();
        updatedUser.setId(userId);
        updatedUser.setEmail("a@b.fr");

        when(userService.updateUser(any(String.class), any(UpdateUserDto.class))).thenReturn(updatedUser);

        mockMvc.perform(put("/users/{id}", userId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateUserDto))
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId))
                .andExpect(jsonPath("$.email").value("a@b.fr"));
    }

    @Test
    @WithMockUser(roles = "COMPANY", username = "a@b.fr")
    public void updateUser_owner_success() throws Exception {
        String userId = "123";
        UpdateUserDto updateUserDto = new UpdateUserDto(
                null,
                "newPassword"
        );
        UserEntity updatedUser = new UserEntity();
        updatedUser.setId(userId);
        updatedUser.setEmail("a@b.fr");

        when(userSecurity.isUser(any(), any(String.class))).thenReturn(true);
        when(userService.updateUser(any(String.class), any(UpdateUserDto.class))).thenReturn(updatedUser);

        mockMvc.perform(put("/users/{id}", userId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateUserDto))
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId))
                .andExpect(jsonPath("$.email").value("a@b.fr"));
    }

    @Test
    public void updateUser_unauthorized() throws Exception {
        String userId = "123";
        mockMvc.perform(put("/users/{id}", userId)
                .contentType(MediaType.APPLICATION_JSON)
                .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "COMPANY", username = "c@d.fr")
    public void updateUser_forbidden() throws Exception {
        String userId = "123";
        UpdateUserDto updateUserDto = new UpdateUserDto(
                null,
                "newPassword"
        );

        when(userSecurity.isUser(any(), any(String.class))).thenReturn(false);

        mockMvc.perform(put("/users/{id}", userId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateUserDto))
                .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void deleteUser_admin_success() throws Exception {
        String userId = "123";

        mockMvc.perform(delete("/users/{id}", userId)
                .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "COMPANY", username = "a@b.fr")
    public void deleteUser_owner_success() throws Exception {
        String userId = "123";

        when(userSecurity.isUser(any(), any(String.class))).thenReturn(true);

        mockMvc.perform(delete("/users/{id}", userId)
                .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    public void deleteUser_unauthorized() throws Exception {
        String userId = "123";
        mockMvc.perform(delete("/users/{id}", userId)
                .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "COMPANY", username = "c@d.fr")
    public void deleteUser_forbidden() throws Exception {
        String userId = "123";

        when(userSecurity.isUser(any(), any(String.class))).thenReturn(false);

        mockMvc.perform(delete("/users/{id}", userId)
                .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @TestConfiguration
    @EnableMethodSecurity
    static class MethodSecurityConfig {
    }
}
