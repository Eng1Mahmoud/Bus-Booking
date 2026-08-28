import { api } from "@/api/client";
import type { SearchTripsResponse } from "@/types/apiResponses";

export interface TripSearch {
  from: string;
  to: string;
  /** `YYYY-M-D`, the format the API stores and compares against. */
  date: string;
}

export const tripService = {
  async search(input: TripSearch): Promise<SearchTripsResponse> {
    const { data } = await api.post<SearchTripsResponse>("/api/trips/search", input);
    return data;
  },
};
