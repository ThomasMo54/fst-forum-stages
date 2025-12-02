package fr.fst.forumstages.backend.auth;

import fr.fst.forumstages.backend.auth.dto.AuthResponseDto;
import fr.fst.forumstages.backend.auth.dto.LoginDto;
import fr.fst.forumstages.backend.auth.dto.RefreshDto;
import fr.fst.forumstages.backend.user.UserEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.NoSuchElementException;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentification", description = "Endpoints pour l'authentification des utilisateurs")
public class AuthController {

    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;

    public AuthController(
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            AuthenticationManager authenticationManager
    ) {
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.authenticationManager = authenticationManager;
    }

    @Operation(summary = "Login", description = "Authentifie un utilisateur et retourne un token JWT ainsi qu'un token de rafraîchissement.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Authentification réussie"),
            @ApiResponse(responseCode = "401", description = "Échec de l'authentification (identifiants invalides)")
    })
    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginDto loginDto) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDto.email(), loginDto.password())
            );
            if (authentication.getPrincipal() instanceof UserDetails userDetails) {
                String token = jwtService.generateToken(userDetails);
                RefreshTokenEntity refreshToken = refreshTokenService.createRefreshToken(userDetails.getUsername());
                return ResponseEntity.ok(new AuthResponseDto(token, refreshToken.getToken()));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @Operation(summary = "Refresh Token", description = "Rafraîchit le token JWT en utilisant un token de rafraîchissement valide.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Token rafraîchi avec succès"),
            @ApiResponse(responseCode = "404", description = "Token de rafraîchissement invalide")
    })
    @PostMapping("/refresh")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<AuthResponseDto> refresh(@Valid @RequestBody RefreshDto refreshDto) {
        String refreshTokenString = refreshDto.refreshToken();
        RefreshTokenEntity refreshToken = refreshTokenService.findByToken(refreshTokenString)
                .orElseThrow(() -> new NoSuchElementException("Refresh token not found"));
        refreshToken = refreshTokenService.verifyExpiration(refreshToken);
        UserEntity user = refreshToken.getUser();
        String newAccessToken = jwtService.generateToken(user);
        refreshTokenService.deleteByUserEmail(user.getEmail());
        RefreshTokenEntity newRefreshToken = refreshTokenService.createRefreshToken(user.getEmail());
        return ResponseEntity.ok(new AuthResponseDto(newAccessToken, newRefreshToken.getToken()));
    }
}
