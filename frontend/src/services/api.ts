import axios from 'axios';
import {
  Train,
  TrainRouteDetail,
  LiveStatus,
  Station,
  StationAutocomplete,
  StationTimetableEntry,
  TrainCompareResponse,
  NetworkMapData,
  Favourite,
  SearchHistoryItem,
  SystemHealth,
  AdminStats,
  AuditLog,
  AuthResponse
} from '../types';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('railway_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  auth: {
    register: (data: { email: string; password: string; full_name?: string }) =>
      apiClient.post<AuthResponse>('/auth/register', data).then(r => r.data),
    login: (data: { email: string; password: string }) =>
      apiClient.post<AuthResponse>('/auth/login', data).then(r => r.data),
    me: () => apiClient.get('/auth/me').then(r => r.data),
  },

  // Trains
  trains: {
    search: (params: {
      query?: string;
      source_code?: string;
      destination_code?: string;
      category?: string;
      operating_day?: string;
      departure_time_range?: string;
      skip?: number;
      limit?: number;
    }) => apiClient.get<Train[]>('/trains/search', { params }).then(r => r.data),
    featured: () => apiClient.get<Train[]>('/trains/popular/featured').then(r => r.data),
    getDetails: (trainNumber: string) => apiClient.get<Train>(`/trains/${trainNumber}`).then(r => r.data),
    getRoute: (trainNumber: string) => apiClient.get<TrainRouteDetail>(`/routes/${trainNumber}`).then(r => r.data),
    getLiveStatus: (trainNumber: string) => apiClient.get<LiveStatus>(`/live-status/${trainNumber}`).then(r => r.data),
    simulateTick: () => apiClient.post('/live-status/simulate-tick').then(r => r.data),
    compare: (trainNumbers: string[]) =>
      apiClient.post<TrainCompareResponse>('/comparison/compare', { train_numbers: trainNumbers }).then(r => r.data),
  },

  // Stations
  stations: {
    search: (params: { query?: string; zone?: string; state?: string; skip?: number; limit?: number }) =>
      apiClient.get<Station[]>('/stations/search', { params }).then(r => r.data),
    autocomplete: (term: string) =>
      apiClient.get<StationAutocomplete[]>('/stations/autocomplete', { params: { term } }).then(r => r.data),
    getDetails: (code: string) => apiClient.get<Station>(`/stations/${code}`).then(r => r.data),
    getTimetable: (code: string) =>
      apiClient.get<StationTimetableEntry[]>(`/stations/${code}/timetable`).then(r => r.data),
  },

  // Map
  map: {
    getNetwork: () => apiClient.get<NetworkMapData>('/map/network').then(r => r.data),
  },

  // User
  user: {
    getFavourites: () => apiClient.get<Favourite[]>('/user/favourites').then(r => r.data),
    addFavourite: (data: { item_type: 'train' | 'station'; train_id?: number; station_id?: number }) =>
      apiClient.post('/user/favourites', data).then(r => r.data),
    removeFavourite: (id: number) => apiClient.delete(`/user/favourites/${id}`).then(r => r.data),
    getHistory: () => apiClient.get<SearchHistoryItem[]>('/user/history').then(r => r.data),
    clearHistory: () => apiClient.delete('/user/history').then(r => r.data),
  },

  // Admin
  admin: {
    getStats: () => apiClient.get<AdminStats>('/admin/stats').then(r => r.data),
    getAuditLogs: (limit = 50) => apiClient.get<AuditLog[]>('/admin/audit-logs', { params: { limit } }).then(r => r.data),
    importCsv: (formData: FormData) =>
      apiClient.post('/admin/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data),
    updateDataSource: (id: number, data: any) =>
      apiClient.put(`/admin/data-sources/${id}`, data).then(r => r.data),
  },

  // System
  system: {
    getHealth: () => apiClient.get<SystemHealth>('/system/health').then(r => r.data),
    getDataSources: () => apiClient.get('/system/data-sources').then(r => r.data),
  },
};
