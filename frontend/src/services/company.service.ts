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

export interface UpdateCompanyDto {
    name: string;
    streetAddress: string | null;
    city: string | null;
    postalCode: string | null;
    country: string | null;
}

const getCompanyById = async (companyId: string): Promise<CompanyDto> => {
    const response = await api.get<CompanyDto>(`/companies/${companyId}`);
    return response.data;
};

const updateCompany = async (companyId: string, updateCompanyDto: UpdateCompanyDto): Promise<CompanyDto> => {
    const response = await api.put<CompanyDto>(`/companies/${companyId}`, updateCompanyDto);
    return response.data;
}

const CompanyService = {
    getCompanyById,
    updateCompany
};

export default CompanyService;
