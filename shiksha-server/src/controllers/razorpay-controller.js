import Razorpay from "razorpay";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "../config/server-config.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import AppError from "../utils/errors/app-error.js";
import { StatusCodes } from "http-status-codes";

/**
 * Initialize Razorpay instance lazily so missing env vars do not crash server startup.
 */
const getRazorpayInstance = () => {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new AppError(
      "Razorpay configuration is missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
  });
};

const buildSuccessResponse = (message, data) => {
  SuccessResponse.message = message;
  SuccessResponse.data = data;
  SuccessResponse.error = {};
  return SuccessResponse;
};

const buildErrorResponse = (message, error = {}) => {
  ErrorResponse.message = message;
  ErrorResponse.error = error;
  ErrorResponse.data = {};
  return ErrorResponse;
};

/**
 * Create Razorpay Order
 * POST /razorpay/create-order
 * Body: { amount, currency, receipt, description, notes? }
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, description, notes = {} } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      throw new AppError("Invalid amount", StatusCodes.BAD_REQUEST);
    }

    if (!receipt) {
      throw new AppError("Receipt ID is required", StatusCodes.BAD_REQUEST);
    }

    if (!description) {
      throw new AppError("Description is required", StatusCodes.BAD_REQUEST);
    }

    // Create order with Razorpay
    const razorpayInstance = getRazorpayInstance();
    const order = await razorpayInstance.orders.create({
      amount: amount * 100, // Convert to smallest currency unit (paise for INR)
      currency,
      receipt,
      description,
      notes
    });

    if (!order) {
      throw new AppError("Failed to create order", StatusCodes.BAD_REQUEST);
    }

    // Return success response
    return res.status(StatusCodes.CREATED).json(
      buildSuccessResponse("Order created successfully", {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status
      })
    );
  } catch (error) {
    console.error("Error creating Razorpay order:", error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json(buildErrorResponse(error.message));
    }

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(buildErrorResponse("Failed to create order"));
  }
};

/**
 * Verify Razorpay Payment Signature
 * POST /razorpay/verify-payment
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new AppError("Missing payment verification data", StatusCodes.BAD_REQUEST);
    }

    // Create signature for verification
    const crypto = await import("crypto");
    const hmac = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET);
    const data = `${razorpay_order_id}|${razorpay_payment_id}`;
    hmac.update(data);
    const generated_signature = hmac.digest("hex");

    // Verify signature
    const isValid = generated_signature === razorpay_signature;

    if (!isValid) {
      throw new AppError("Invalid payment signature", StatusCodes.UNAUTHORIZED);
    }

    // Return success response
    return res.status(StatusCodes.OK).json(
      buildSuccessResponse("Payment verified successfully", {
        valid: true,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      })
    );
  } catch (error) {
    console.error("Error verifying payment:", error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json(buildErrorResponse(error.message));
    }

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(buildErrorResponse("Failed to verify payment"));
  }
};

/**
 * Get Razorpay Payment Details
 * GET /razorpay/payment/:paymentId
 */
export const getRazorpayPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      throw new AppError("Payment ID is required", StatusCodes.BAD_REQUEST);
    }

    // Fetch payment details from Razorpay
    const razorpayInstance = getRazorpayInstance();
    const payment = await razorpayInstance.payments.fetch(paymentId);

    if (!payment) {
      throw new AppError("Payment not found", StatusCodes.NOT_FOUND);
    }

    // Return success response
    return res.status(StatusCodes.OK).json(
      buildSuccessResponse("Payment details retrieved successfully", {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        description: payment.description,
        created_at: payment.created_at
      })
    );
  } catch (error) {
    console.error("Error fetching payment:", error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json(buildErrorResponse(error.message));
    }

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(buildErrorResponse("Failed to fetch payment"));
  }
};

/**
 * Refund Razorpay Payment
 * POST /razorpay/refund/:paymentId
 * Body: { amount?, notes? }
 */
export const refundRazorpayPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, notes = {} } = req.body;

    if (!paymentId) {
      throw new AppError("Payment ID is required", StatusCodes.BAD_REQUEST);
    }

    // Create refund
    const razorpayInstance = getRazorpayInstance();
    const refund = await razorpayInstance.payments.refund(paymentId, {
      amount: amount ? amount * 100 : undefined, // Convert to paise if specified
      notes
    });

    if (!refund) {
      throw new AppError("Failed to create refund", StatusCodes.BAD_REQUEST);
    }

    // Return success response
    return res.status(StatusCodes.CREATED).json(
      buildSuccessResponse("Refund created successfully", {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
        paymentId: refund.payment_id
      })
    );
  } catch (error) {
    console.error("Error creating refund:", error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json(buildErrorResponse(error.message));
    }

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(buildErrorResponse("Failed to create refund"));
  }
};
