package fr.fst.forumstages.backend.auth;

import fr.fst.forumstages.backend.auth.dto.AuthResponseDto;
import fr.fst.forumstages.backend.auth.dto.LoginDto;
import fr.fst.forumstages.backend.auth.dto.RefreshDto;
import fr.fst.forumstages.backend.user.UserEntity;
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
