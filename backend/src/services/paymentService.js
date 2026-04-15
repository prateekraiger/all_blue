const Razorpay = require('razorpay');
const crypto = require('crypto');
const { AppError } = require('../middlewares/errorHandler');

let razorpayInstance = null;

const getRazorpay = () => {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new AppError('Razorpay credentials not configured', 500);
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

/**
 * Create a Razorpay order.
 * @param {number} amount - Amount in INR (will be converted to paise)
 * @param {string} orderId - Your internal order ID (used as receipt)
 */
const createRazorpayOrder = async (amount, orderId) => {
  const razorpay = getRazorpay();

  const options = {
    amount: Math.round(amount * 100), // Convert to paise
    currency: 'INR',
    receipt: `order_${orderId}`,
    notes: {
      order_id: orderId,
    },
  };

  try {
    const razorpayOrder = await razorpay.orders.create(options);
    return razorpayOrder;
  } catch (err) {
    throw new AppError(`Razorpay error: ${err.message}`, 500);
  }
};

/**
 * Verify Razorpay payment signature.
 */
const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) throw new AppError('Razorpay not configured', 500);

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return generatedSignature === razorpaySignature;
};

module.exports = { createRazorpayOrder, verifyPaymentSignature };
