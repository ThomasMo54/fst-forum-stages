import api from "./api.ts";

export interface CreateApplicationDto {
    studentId: string;
    offerId: string;
}

export interface ApplicationDto {
    id: string;
    studentId: string;
    offerId: string;
}

const createApplication = async (applicationData: CreateApplicationDto): Promise<ApplicationDto> => {
    const response = await api.post('/applications', applicationData);
    return response.data;
}

const getAllApplicationsForOffer = async (offerId: string): Promise<ApplicationDto[]> => {
    const response = await api.get<ApplicationDto[]>(`/applications/offer/${offerId}`);
    return response.data;
}

const getAllApplicationForStudent = async (studentId: string): Promise<ApplicationDto[]> => {
    const response = await api.get<ApplicationDto[]>(`/applications/student/${studentId}`);
    return response.data;
}

const deleteApplication = async (applicationId: string) : Promise<ApplicationDto> => {
    const response = await api.delete<ApplicationDto>(`/applications/${applicationId}`);
    return response.data;
}

const uploadCoverLetter = async (applicationId: string): Promise<string> => {
    const response = await api.put<string>(`/applications/${applicationId}/coverLetter`);
    return response.data;
}

const getCoverLetterUrl = async (applicationId: string): Promise<string> => {
    const response = await api.get<string>(`/applications/${applicationId}/coverLetter`);
    return response.data;
}

const getCoverLetterDeleteUrl = async (applicationId: string): Promise<string> => {
    const response = await api.delete<string>(`/applications/${applicationId}/coverLetter`);
    return response.data;
}

const ApplicationService = {
    createApplication,
    getAllApplicationsForOffer,
    getAllApplicationForStudent,
    deleteApplication,
    uploadCoverLetter,
    getCoverLetterUrl,
    getCoverLetterDeleteUrl
};

export default ApplicationService;