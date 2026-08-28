import { paymentService } from "../services/paymentService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import type {
  PaypalOrderIdParams,
  SeatSelection,
} from "../validation/bookingSchemas.js";
import type { Request } from "express";

const caller = (req: Request): { id: string; email: string } => {
  if (!req.user) throw ApiError.unauthorized();
  return { id: req.user.sub, email: req.user.email };
};

export const paymentController = {
  createOrder: asyncHandler(async (req, res) => {
    const { id, email } = caller(req);
    const result = await paymentService.createOrder(
      id,
      email,
      req.validated?.body as SeatSelection,
    );
    res.status(201).json(result);
  }),

  captureOrder: asyncHandler(async (req, res) => {
    const { id } = caller(req);
    const { orderId } = req.validated?.params as PaypalOrderIdParams;
    const result = await paymentService.captureOrder(id, orderId);
    res.status(200).json(result);
  }),

  cancelOrder: asyncHandler(async (req, res) => {
    const { id } = caller(req);
    const { orderId } = req.validated?.params as PaypalOrderIdParams;
    res.status(200).json(await paymentService.cancelOrder(id, orderId));
  }),
};
