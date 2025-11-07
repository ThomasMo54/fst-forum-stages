package fr.fst.forumstages.backend.company;

import fr.fst.forumstages.backend.company.dto.CompanyDto;
import fr.fst.forumstages.backend.company.dto.CreateCompanyDto;
import fr.fst.forumstages.backend.company.dto.UpdateCompanyDto;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping
    public CompanyDto createCompany(@Valid @RequestBody CreateCompanyDto createCompanyDto) {
        CompanyEntity companyEntity = companyService.createCompany(createCompanyDto);
        return CompanyDto.fromEntity(companyEntity);
    }

    @GetMapping("/{id}")
    public CompanyDto findCompanyById(@PathVariable("id") String id) {
        CompanyEntity companyEntity = companyService.findCompanyById(id);
        return CompanyDto.fromEntity(companyEntity);
    }

    @PutMapping("/{id}")
    public CompanyDto updateCompany(@PathVariable("id") String id, @Valid @RequestBody UpdateCompanyDto updateCompanyDto) {
        CompanyEntity companyEntity = companyService.updateCompany(id, updateCompanyDto);
        return CompanyDto.fromEntity(companyEntity);
    }

    @DeleteMapping("/{id}")
    public void deleteCompany(@PathVariable("id") String id) {
        companyService.deleteCompany(id);
    }
}
