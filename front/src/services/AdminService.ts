import { apiClient } from './ApiClient';
import { ApiResponse } from '../types';

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface AdminData {
  name: string;
  email: string;
  password: string;
}

export class AdminService {
  async login(credentials: AdminLoginCredentials): Promise<ApiResponse & { token?: string }> {
    const response = await apiClient.post<ApiResponse & { token?: string }>('/admins/login', credentials);
    if (response.data.token) {
      apiClient.setToken(response.data.token);
    }
    return response.data;
  }

  async getAdmins(): Promise<AdminData[]> {
    const response = await apiClient.get<AdminData[]>('/admins');
    return response.data;
  }

  async addAdmin(admin: AdminData): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/admins', admin);
    return response.data;
  }

  async deleteAdmin(email: string): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(`/admins/${email}`);
    return response.data;
  }

  async addTrip(tripData: {
    from: string;
    to: string;
    date: string;
    busNumber: string;
    time: string;
    capacity: number;
    priceSeat: number;
  }): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/admins/trips', tripData);
    return response.data;
  }

  async deleteTrip(
    from: string,
    to: string,
    date: string,
    busNumber: string
  ): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `/admins/trips/${from}/${to}/${date}/${busNumber}`
    );
    return response.data;
  }
}

export const adminService = new AdminService();
