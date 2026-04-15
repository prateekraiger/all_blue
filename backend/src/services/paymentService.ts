import Razorpay from 'razorpay';
import crypto from 'crypto';
import { AppError } from '../middlewares/errorHandler';
import type { RazorpayOrderResult } from '../types';

// Lazy-initialised singleton — avoids crashing at startup if env vars are absent
let razorpayInstance: Razorpay | null = null;

const getRazorpay = (): Razorpay => {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new AppError('Razorpay credentials not configured', 500);
    }

    razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return razorpayInstance;
};

/**
 * Create a Razorpay order.
 *
 * @param amount   - Amount in INR (the function converts to paise internally)
 * @param orderId  - Your internal UUID order ID, used as the receipt reference
 */
export const createRazorpayOrder = async (
  amount: number,
  orderId: string
): Promise<RazorpayOrderResult> => {
  const razorpay = getRazorpay();

  const options = {
    amount: Math.round(amount * 100), // Convert INR → paise
    currency: 'INR',
    receipt: `order_${orderId}`,
    notes: { order_id: orderId },
  };

  try {
    const razorpayOrder = await razorpay.orders.create(options);
    return razorpayOrder as unknown as RazorpayOrderResult;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new AppError(`Razorpay error: ${message}`, 500);
  }
};

/**
 * Verify the HMAC-SHA256 signature returned by Razorpay after a payment.
 *
 * @returns true if the signature matches, false otherwise
 */
export const verifyPaymentSignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) throw new AppError('Razorpay not configured', 500);

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return generatedSignature === razorpaySignature;
};
