import api from "./api.ts";

export interface UserDto {
  id: string;
  email: string;
  role: string;
  displayName?: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

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

const getUsers = async (page: number, size: number, role: string | undefined): Promise<PageResponse<UserDto>> => {
  const params: any = { page, size };
  if (role) {
    params.role = role;
  }
  const response = await api.get('/users', { params });
  return response.data;
}

const getDisplayName = async (entityId: string, roles: string[]): Promise<string> => {
  if (roles.includes('COMPANY')) {
    const response = await api.get(`/companies/${entityId}`);
    return response.data.name ?? 'User';
  } else if (roles.includes('STUDENT')) {
    const response = await api.get(`/students/${entityId}`);
    return `${response.data.firstName ?? ''} ${response.data.lastName ?? 'User'}`;
  } else if (roles.includes('ADMIN')) {
    return 'Admin';
  }
  return 'User';
}

const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/users/${userId}`);
}

const UserService = {
  registerCompany,
  registerStudent,
  verifyUser,
  refreshVerificationCode,
  getUsers,
  getDisplayName,
  deleteUser
};

export default UserService;
