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

export interface VerifyUserDto {
  email: string;
  verificationCode: string;
}

const registerCompany = async (companyData: CreateCompanyDto): Promise<void> => {
  await api.post('/users/company', companyData);
};

const verifyUser = async (verifyData: VerifyUserDto): Promise<void> => {
  await api.post(`/users/verify`, verifyData);
}

const UserService = {
  registerCompany,
  verifyUser,
};

export default UserService;