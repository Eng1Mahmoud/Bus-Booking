import { apiClient } from './ApiClient';
import { Trip, ApiResponse } from '../types';

export class TripService {
  async searchTrips(from: string, to: string, date: string): Promise<Trip[]> {
    const response = await apiClient.post<Trip[]>('/search', { from, to, date });
    return response.data;
  }

  async getAllTrips(): Promise<Trip[]> {
    const response = await apiClient.get<Trip[]>('/trips');
    return response.data;
  }

  async bookSeat(
    from: string,
    to: string,
    date: string,
    busNumber: string,
    seatNumber: number,
    seatePrice: number
  ): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>('/book', {
      from,
      to,
      date,
      busNumber,
      seatNumber,
      seatePrice,
    });
    return response.data;
  }
}

export const tripService = new TripService();
