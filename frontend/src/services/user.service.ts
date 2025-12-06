import api from "./api.ts";

export interface CreateCompanyDto {
  email: string;
  password: string;
  name: string;
  contactEmail?: string;
  streetAddress?: string;
  city?: string;
  postalCode?: string;
  country: string;
}

const registerCompany = async (companyData: CreateCompanyDto): Promise<void> => {
  await api.post('/users/company', companyData);
};

const UserService = {
  registerCompany
};

export default UserService;