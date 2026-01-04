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

const getStudentByUserId = async (userId: string): Promise<StudentDto> => {
    const response = await api.get<StudentDto>(`/students/by-user/${userId}`);
    return response.data;
}

const StudentService = {
    updateStudent,
    getStudentByUserId
};

export default StudentService;