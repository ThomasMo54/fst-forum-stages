import api from "./api.ts";

export interface CreateOfferDto {
  title: string;
  description: string;
  tags: string[];
  salary: string;
  internshipStartDate: string;
  internshipDuration: string;
  limitApplicationDate: string;
  studyLevel: string;
  remoteWorkPolicy: string;
  companyId?: string;
}

export interface OfferDto {
  id: string;
  title: string;
  description: string;
  tags?: string[] | null;
  salary?: string | null;
  creationDate: string;
  internshipStartDate?: string | null;
  internshipDuration?: string | null;
  limitApplicationDate?: string | null;
  studyLevel?: string | null;
  remoteWorkPolicy?: string | null;
  companyId: string;
}

const createOffer = async (offerData: CreateOfferDto): Promise<void> => {
  await api.post('/offers', offerData);
};

const getAllOffers = async (): Promise<OfferDto[]> => {
  const response = await api.get('/offers');
  return response.data;
};

const getOfferById = async (offerId: string): Promise<OfferDto> => {
  const response = await api.get(`/offers/${offerId}`);
  return response.data;
};

const getOffersByCompany = async (companyId: string): Promise<OfferDto[]> => {
  const response = await api.get<OfferDto[]>(`/companies/${companyId}/offers`);
  return response.data;
};

const deleteOffer = async (offerId: string): Promise<void> => {
  await api.delete(`/offers/${offerId}`);
};

const OfferService = {
  createOffer,
  getAllOffers,
  getOfferById,
  getOffersByCompany,
  deleteOffer
};

export default OfferService;
