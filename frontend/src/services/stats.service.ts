import api from "./api.ts";

export interface GlobalUserStatsDto {
  totalStudents: number;
  totalCompanies: number;
}

export interface GlobalOfferStatsDto {
  totalOffers: number;
}

export interface GlobalApplicationStatsDto {
  totalApplications: number;
}

export interface TemporalUserStatsDto {
  students: number[];
  companies: number[];
}

export interface TemporalOfferStatsDto {
  offers: number[];
}

export interface TemporalApplicationStatsDto {
  applications: number[];
}

export const statsPeriods = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
}

const getGlobalUserStats = async (): Promise<GlobalUserStatsDto> => {
  const response = await api.get('/stats/users');
  return response.data;
};

const getGlobalOfferStats = async (): Promise<GlobalOfferStatsDto> => {
  const response = await api.get('/stats/offers');
  return response.data;
}

const getGlobalApplicationStats = async (): Promise<GlobalApplicationStatsDto> => {
  const response = await api.get('/stats/applications');
  return response.data;
}

const getTemporalUserStats = async (period: string): Promise<TemporalUserStatsDto> => {
  const response = await api.get('/stats/users/period?period=' + period);
  return response.data;
};

const getTemporalOfferStats = async (period: string): Promise<TemporalOfferStatsDto> => {
  const response = await api.get('/stats/offers/period?period=' + period);
  return response.data;
}

const getTemporalApplicationStats = async (period: string): Promise<TemporalApplicationStatsDto> => {
  const response = await api.get('/stats/applications/period?period=' + period);
  return response.data;
}

const StatsService = {
  getGlobalUserStats,
  getGlobalOfferStats,
  getGlobalApplicationStats,
  getTemporalUserStats,
  getTemporalOfferStats,
  getTemporalApplicationStats
};

export default StatsService;