import api from "./api.ts";

export interface StudentDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentNumber: string;
  phone: string;
  educationLevel: string;
  fieldOfStudy: string;
  specialization: string;
  yearOfStudy: number;
  skills: string[];
  cvPath: string;
  registrationDate: string;
  userId: string;
}

export interface UpdateStudentDto {
  firstName: string;
  lastName: string;
  email: string;
  studentNumber: string;
  phone: string;
  educationLevel: string;
  fieldOfStudy: string;
  specialization: string;
  yearOfStudy: number;
  skills: string[];
}

const updateStudent = async (studentId: string, updateStudentDto: UpdateStudentDto): Promise<StudentDto> => {
  const response = await api.put<StudentDto>(`/students/${studentId}`, updateStudentDto);
  return response.data;
};

const getStudentById = async (studentId: string): Promise<StudentDto> => {
  const response = await api.get<StudentDto>(`/students/${studentId}`);
  return response.data;
}

const getResumeUrl = async (studentId: string): Promise<string> => {
  const response = await api.get<string>(`/students/${studentId}/resume`);
  return response.data;
}

const uploadResume = async (studentId: string, file: File): Promise<void> => {
  const response = await api.put<string>(`/students/${studentId}/resume`);
  const uploadUrl = response.data;

  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': 'application/pdf',
    },
  });
}

const StudentService = {
  updateStudent,
  getStudentById,
  getResumeUrl,
  uploadResume
};

export default StudentService;