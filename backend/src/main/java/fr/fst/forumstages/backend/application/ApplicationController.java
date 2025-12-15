package fr.fst.forumstages.backend.application;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import fr.fst.forumstages.backend.application.dto.ApplicationDto;
import fr.fst.forumstages.backend.application.dto.CreateApplicationDto;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/applications")
public class ApplicationController {
    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationDto createApplication(@Valid @RequestBody CreateApplicationDto createApplicationDto) {

        var applicationEntity = this.applicationService.createApplication(createApplicationDto);
        return ApplicationDto.fromEntity(applicationEntity);
    }

    @GetMapping("/offer/{offerId}")
    public List<ApplicationDto> getAllApplicationsForOffer(@PathVariable String offerId) {
        var applications = applicationService.getApplicationsForOffer(offerId);
        return applications.stream().map(ApplicationDto::fromEntity).toList();
    }

    @GetMapping("/student/{studentId}")
    public List<ApplicationDto> getAllApplicationsForStudent(@PathVariable String studentId) {
        var applications = applicationService.getApplicationsForOffer(studentId);
        return applications.stream().map(ApplicationDto::fromEntity).toList();
    }
}
