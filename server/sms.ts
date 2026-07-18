/**
 * SMS Notifications — Luxurious Habbits
 * Twilio-powered SMS for order confirmation and shipping updates.
 * Only sends if TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER are set.
 */

import twilio from "twilio";

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
}

function getFromNumber() {
  return process.env.TWILIO_FROM_NUMBER ?? "";
}

/**
 * Send a raw SMS. Returns true on success, false if Twilio is not configured or send fails.
 */
export async function sendSMS(to: string, body: string): Promise<boolean> {
  const client = getClient();
  const from = getFromNumber();
  if (!client || !from) {
    console.warn("[SMS] Twilio not configured — skipping SMS to", to);
    return false;
  }
  // Normalize phone number — ensure it starts with +1 for US numbers
  const normalized = to.startsWith("+") ? to : `+1${to.replace(/\D/g, "")}`;
  if (normalized.replace(/\D/g, "").length < 10) {
    console.warn("[SMS] Invalid phone number:", to);
    return false;
  }
  try {
    await client.messages.create({ to: normalized, from, body });
    return true;
  } catch (err) {
    console.error("[SMS] Failed to send SMS:", err);
    return false;
  }
}

/**
 * Send order confirmation SMS.
 */
export async function sendOrderConfirmationSMS(params: {
  phone: string;
  orderNumber: string;
  total: number;
  firstName: string;
}): Promise<boolean> {
  const { phone, orderNumber, total, firstName } = params;
  const body = [
    `Luxurious Habbits — Order Confirmed! 🌿`,
    `Hi ${firstName}, your order #${orderNumber} has been received.`,
    `Total: $${(total / 100).toFixed(2)}`,
    `You'll get another text when it ships. Questions? support@luxurioushabbits.com`,
    `Reply STOP to unsubscribe.`,
  ].join("\n");
  return sendSMS(phone, body);
}

/**
 * Send shipping notification SMS with tracking info.
 */
export async function sendShippingNotificationSMS(params: {
  phone: string;
  orderNumber: string;
  trackingNumber: string;
  carrier: string;
  firstName: string;
}): Promise<boolean> {
  const { phone, orderNumber, trackingNumber, carrier, firstName } = params;

  // Build carrier tracking URL
  const carrierUrls: Record<string, string> = {
    UPS: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    USPS: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    FedEx: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
  };
  const trackingUrl = carrierUrls[carrier] ?? `https://www.ups.com/track?tracknum=${trackingNumber}`;

  const body = [
    `Luxurious Habbits — Your order shipped! 📦`,
    `Hi ${firstName}, order #${orderNumber} is on its way.`,
    `Carrier: ${carrier} | Tracking: ${trackingNumber}`,
    `Track: ${trackingUrl}`,
    `Adult signature required upon delivery. Reply STOP to unsubscribe.`,
  ].join("\n");
  return sendSMS(phone, body);
}
