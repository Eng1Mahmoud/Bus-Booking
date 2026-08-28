import { api } from "@/api/client";
import type { CaptureOrderResponse, CreateOrderResponse } from "@/types/apiResponses";

export interface SeatSelection {
  from: string;
  to: string;
  date: string;
  busNumber: string;
  seatNumber: number;
}

/**
 * Checkout, in the order the server expects it.
 *
 * Note the absence of a price anywhere in this file: the server reads it from
 * the trip. A `createOrder` that accepted an amount is what made free tickets
 * possible before Phase 3.
 */
export const paymentService = {
  async createOrder(selection: SeatSelection): Promise<CreateOrderResponse> {
    const { data } = await api.post<CreateOrderResponse>(
      "/api/payments/orders",
      selection,
    );
    return data;
  },

  async captureOrder(orderId: string): Promise<CaptureOrderResponse> {
    const { data } = await api.post<CaptureOrderResponse>(
      `/api/payments/orders/${orderId}/capture`,
    );
    return data;
  },

  async cancelOrder(orderId: string): Promise<void> {
    await api.post(`/api/payments/orders/${orderId}/cancel`);
  },
};
