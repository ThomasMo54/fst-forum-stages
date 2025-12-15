import api from "./api.ts";

export interface CompanyDto {
    id: string;
    name: string;
    contactEmail: string;
    streetAddress: string;
    city: string;
    postalCode: string;
    country: string;
}

const getCompanyById = async (companyId: string): Promise<CompanyDto> => {
    const response = await api.get<CompanyDto>(`/companies/${companyId}`);
    return response.data;
};

const CompanyService = {
    getCompanyById,
};

export default CompanyService;
