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
  internshipStartDate: string;
  internshipDuration: string;
  limitApplicationDate: string;
  studyLevel?: string | null;
  remoteWorkPolicy?: string | null;
  companyId: string;
  offerOpen: boolean;
}

export interface PaginatedOffers {
  content: OfferDto[];
  page: {
    size: number,
    number: number,
    totalElements: number,
    totalPages: number
  }
}

export interface OfferFilters {
  keyword?: string;
  city?: string;
  studyLevel?: string;
  remoteWorkPolicy?: string;
  duration?: string;
}

export interface ApplyOfferDto {
  fullName: string;
  email: string;
  phone?: string;
  cvLink?: string;
  coverLetter: string;
  availability?: string;
  portfolio?: string;
}

const createOffer = async (offerData: CreateOfferDto): Promise<void> => {
  await api.post('/offers', offerData);
};

const getAllOffers = async (page: number = 0, filters?: OfferFilters): Promise<PaginatedOffers> => {
  const params: Record<string, string | number> = { page };

  if (filters?.keyword?.trim()) params.keyword = filters.keyword.trim();
  if (filters?.city?.trim()) params.city = filters.city.trim();
  if (filters?.studyLevel?.trim()) params.studyLevel = filters.studyLevel.trim();
  if (filters?.remoteWorkPolicy?.trim()) params.remoteWorkPolicy = filters.remoteWorkPolicy.trim();
  if (filters?.duration?.trim()) params.duration = filters.duration.trim();

  const response = await api.get('/offers', { params });
  return response.data;
};

const getOfferById = async (offerId: string): Promise<OfferDto> => {
  const response = await api.get(`/offers/${offerId}`);
  return response.data;
};

const getOffersByCompany = async (companyId: string, page:number = 0): Promise<PaginatedOffers> => {
  const response = await api.get<PaginatedOffers>(`/companies/${companyId}/offers?page=${page}`);
  return response.data;
};

const updateOffer = async (offerId: string, offerData: CreateOfferDto): Promise<void> => {
  await api.put(`/offers/${offerId}`, offerData);
}

const deleteOffer = async (offerId: string): Promise<void> => {
  await api.delete(`/offers/${offerId}`);
};

const applyToOffer = async (offerId: string, application: ApplyOfferDto): Promise<void> => {
  await api.post(`/offers/${offerId}/apply`, application);
};

const changeOfferStatus = async (offerId: string): Promise<OfferDto> => {
  const response = await api.put(`/offers/${offerId}/change-status`);
  console.log("API response for changeOfferStatus:", response);
  return response.data;
};

const OfferService = {
  createOffer,
  getAllOffers,
  getOfferById,
  getOffersByCompany,
  updateOffer,
  deleteOffer,
  applyToOffer,
  changeOfferStatus
};

export default OfferService;
