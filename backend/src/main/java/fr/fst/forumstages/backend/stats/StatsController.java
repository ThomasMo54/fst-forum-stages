package fr.fst.forumstages.backend.stats;

import fr.fst.forumstages.backend.application.ApplicationRepository;
import fr.fst.forumstages.backend.offer.OfferRepository;
import fr.fst.forumstages.backend.stats.dto.*;
import fr.fst.forumstages.backend.user.UserRepository;
import fr.fst.forumstages.backend.user.UserRole;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;

@Slf4j
@RestController
@RequestMapping("/stats")
public class StatsController {

    private final UserRepository userRepository;
    private final OfferRepository offerRepository;
    private final ApplicationRepository applicationRepository;

    public StatsController(UserRepository userRepository, OfferRepository offerRepository, ApplicationRepository applicationRepository) {
        this.userRepository = userRepository;
        this.offerRepository = offerRepository;
        this.applicationRepository = applicationRepository;
    }

    @Operation(summary = "Récupère les statistiques concernant les utilisateurs de l'application", description = "Permet de récupérer les statistiques des utilisateurs.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Statistiques récupérées avec succès"),
    })
    @GetMapping("/users")
    public GlobalUserStatsDto getGlobalUserStats() {
        Long totalStudents = userRepository.countByRole(UserRole.STUDENT);
        Long totalCompanies = userRepository.countByRole(UserRole.COMPANY);
        return new GlobalUserStatsDto(totalStudents, totalCompanies);
    }

    @Operation(summary = "Récupère les statistiques concernant les utilisateurs de l'application pour une période donnée", description = "Permet de récupérer les statistiques des utilisateurs pour une période donnée (day, week, month, year).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Statistiques récupérées avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé - permissions insuffisantes"),
            @ApiResponse(responseCode = "404", description = "Période invalide fournie")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users/period")
    public TemporalUserStatsDto getUserStatsForPeriod(@RequestParam String period) {
        try {
            StatsPeriod statsPeriod = StatsPeriod.valueOf(period.toUpperCase(Locale.ROOT));
            List<LocalDateTime> periodStartDates = getPeriodStartDates(statsPeriod);
            List<Long> students = periodStartDates.stream()
                    .map(date -> userRepository.countByRoleAndCreatedAtBefore(UserRole.STUDENT, date))
                    .toList();
            List<Long> companies = periodStartDates.stream()
                    .map(date -> userRepository.countByRoleAndCreatedAtBefore(UserRole.COMPANY, date))
                    .toList();
            return new TemporalUserStatsDto(students, companies);
        } catch (IllegalArgumentException e) {
            throw new NoSuchElementException("Invalid period: " + period);
        }
    }

    @Operation(summary = "Récupère les statistiques concernant les offres de l'application", description = "Permet de récupérer les statistiques des offres.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Statistiques récupérées avec succès"),
    })
    @GetMapping("/offers")
    public GlobalOfferStatsDto getGlobalOfferStats() {
        Long totalOffers = offerRepository.count();
        return new GlobalOfferStatsDto(totalOffers);
    }

    @Operation(summary = "Récupère les statistiques concernant les offres de l'application pour une période donnée", description = "Permet de récupérer les statistiques des offres pour une période donnée (day, week, month, year).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Statistiques récupérées avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé - permissions insuffisantes"),
            @ApiResponse(responseCode = "404", description = "Période invalide fournie")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/offers/period")
    public TemporalOfferStatsDto getOfferStatsForPeriod(@RequestParam String period) {
        try {
            StatsPeriod statsPeriod = StatsPeriod.valueOf(period.toUpperCase(Locale.ROOT));
            List<LocalDateTime> periodStartDates = getPeriodStartDates(statsPeriod);
            List<Long> totalOffers = periodStartDates.stream()
                    .map(offerRepository::countByCreationDateBefore)
                    .toList();
            return new TemporalOfferStatsDto(totalOffers);
        } catch (IllegalArgumentException e) {
            throw new NoSuchElementException("Invalid period: " + period);
        }
    }

    @Operation(summary = "Récupère les statistiques concernant les candidatures de l'application", description = "Permet de récupérer les statistiques des candidatures.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Statistiques récupérées avec succès"),
    })
    @GetMapping("/applications")
    public GlobalApplicationStatsDto getGlobalApplicationStats() {
        Long totalApplications = applicationRepository.count();
        return new GlobalApplicationStatsDto(totalApplications);
    }

    @Operation(summary = "Récupère les statistiques concernant les candidatures de l'application pour une période donnée", description = "Permet de récupérer les statistiques des candidatures pour une période donnée (day, week, month, year).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Statistiques récupérées avec succès"),
            @ApiResponse(responseCode = "403", description = "Accès refusé - permissions insuffisantes"),
            @ApiResponse(responseCode = "404", description = "Période invalide fournie")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/applications/period")
    public TemporalApplicationStatsDto getApplicationStatsForPeriod(@RequestParam String period) {
        try {
            StatsPeriod statsPeriod = StatsPeriod.valueOf(period.toUpperCase(Locale.ROOT));
            List<LocalDateTime> periodStartDates = getPeriodStartDates(statsPeriod);
            List<Long> totalApplications = periodStartDates.stream()
                    .map(applicationRepository::countByCreatedAtBefore)
                    .toList();
            return new TemporalApplicationStatsDto(totalApplications);
        } catch (IllegalArgumentException e) {
            throw new NoSuchElementException("Invalid period: " + period);
        }
    }

    private List<LocalDateTime> getPeriodStartDates(StatsPeriod period) {
        LocalDateTime now = LocalDateTime.now();
        switch (period) {
            case DAY -> {
                return List.of(now, now.minusHours(2), now.minusHours(4), now.minusHours(6), now.minusHours(8), now.minusHours(10), now.minusHours(12), now.minusHours(14), now.minusHours(16), now.minusHours(18), now.minusHours(20), now.minusHours(22), now.minusHours(24));
            }
            case WEEK -> {
                return List.of(now, now.minusDays(1), now.minusDays(2), now.minusDays(3), now.minusDays(4), now.minusDays(5), now.minusDays(6), now.minusDays(7));
            }
            case MONTH -> {
                return List.of(now, now.minusWeeks(1), now.minusWeeks(2), now.minusWeeks(3), now.minusMonths(1));
            }
            case YEAR -> {
                return List.of(now, now.minusMonths(1), now.minusMonths(2), now.minusMonths(3), now.minusMonths(4), now.minusMonths(5), now.minusMonths(6), now.minusMonths(7), now.minusMonths(8), now.minusMonths(9), now.minusMonths(10), now.minusMonths(11), now.minusMonths(12));
            }
        }
        return List.of();
    }
}
