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

export interface CreateStudentDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  studentNumber: string;
  phone: string;
  educationLevel: string;
  fieldOfStudy: string;
  specialization: string;
  yearOfStudy: number;
}

export interface VerifyUserDto {
  email: string;
  verificationCode: string;
}

const registerCompany = async (companyData: CreateCompanyDto): Promise<void> => {
  await api.post('/users/company', companyData);
};

const registerStudent = async (studentData: CreateStudentDto): Promise<void> => {
  await api.post('/users/student', studentData);
};

const verifyUser = async (verifyData: VerifyUserDto): Promise<void> => {
  await api.post(`/users/verify`, verifyData);
};

const refreshVerificationCode = async (email: string): Promise<void> => {
  await api.post(`/users/refresh-verification`, { email });
};

const UserService = {
  registerCompany,
  registerStudent,
  verifyUser,
  refreshVerificationCode,
};

export default UserService;