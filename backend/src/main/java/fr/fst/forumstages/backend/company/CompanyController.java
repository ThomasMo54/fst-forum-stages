package fr.fst.forumstages.backend.company;

import fr.fst.forumstages.backend.company.dto.CompanyDto;
import fr.fst.forumstages.backend.company.dto.UpdateCompanyDto;
import fr.fst.forumstages.backend.offer.OfferEntity;
import fr.fst.forumstages.backend.offer.dto.OfferDto;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
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

    @GetMapping("/{id}/offers")
    public List<OfferDto> getAllOffers(@PathVariable("id") String companyId) {
        List<OfferEntity> offersEntity = companyService.getCompanyOffers(companyId);
        return offersEntity.stream().map(OfferDto::fromEntity).toList();
    }
}
