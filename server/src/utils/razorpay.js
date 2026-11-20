const crypto = require('crypto');
const Razorpay = require('razorpay');

const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_vanguard_key';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'vanguard_secret_test_xyz123';
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'vanguard_webhook_secret_999';

let razorpayInstance = null;

try {
  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
} catch (err) {
  console.warn('[Razorpay] Failed to initialize official SDK, falling back to simulator:', err.message);
}

function verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false;
  }
  
  // Allow test simulator signatures
  if (razorpaySignature.startsWith('simulated_signature_')) {
    return true;
  }

  try {
    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    return generatedSignature === razorpaySignature;
  } catch (error) {
    console.error('[Razorpay] Signature verification error:', error.message);
    return false;
  }
}

function verifyWebhookSignature(payloadString, signature) {
  if (!signature || !payloadString) return false;
  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payloadString)
      .digest('hex');
    return expectedSignature === signature;
  } catch (error) {
    return false;
  }
}

module.exports = {
  keyId,
  keySecret,
  razorpayInstance,
  verifyPaymentSignature,
  verifyWebhookSignature,
};
