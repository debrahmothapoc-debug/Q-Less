/**
 * SMS Service — Africa's Talking
 * Docs: https://developers.africastalking.com/docs/sms/sending
 *
 * In development (AT_USERNAME=sandbox) messages are free and go to the
 * Africa's Talking simulator dashboard, not real phones.
 */

let AT;
try {
  const AfricasTalking = require("africastalking");
  AT = AfricasTalking({
    apiKey:   process.env.AT_API_KEY   || "sandbox_key",
    username: process.env.AT_USERNAME  || "sandbox",
  });
} catch {
  // Package not installed yet — SMS will log to console instead
  AT = null;
}

/**
 * Send an SMS.
 * @param {string} to   — SA number e.g. "+27711234567"
 * @param {string} text — message body
 */
async function sendSMS(to, text) {
  // Normalise SA numbers: 071... → +2771...
  const number = to.startsWith("0") ? "+27" + to.slice(1) : to;

  if (!AT) {
    // Fallback: log to console (useful during dev without the package)
    console.log(`[SMS MOCK] To: ${number}\n${text}\n`);
    return { mock: true };
  }

  try {
    const sms = AT.SMS;
    const result = await sms.send({
      to:     [number],
      message: text,
      from:   process.env.AT_SENDER_ID || "Q-Less",
    });
    console.log("[SMS] Sent:", result);
    return result;
  } catch (err) {
    // Non-fatal — booking still succeeds even if SMS fails
    console.error("[SMS] Failed:", err.message);
    return { error: err.message };
  }
}

/** Booking confirmation SMS */
function bookingConfirmationSMS(booking, route, slot) {
  return (
    `Q-Less Booking Confirmed!\n` +
    `Ref: ${booking.booking_ref}\n` +
    `Route: ${route.from_place} → ${route.to_place}\n` +
    `Time: ${slot.departure_time.slice(0,5)}\n` +
    `Seats: ${booking.seats}\n` +
    `Fare: R${route.fare_rands} p/p (pay driver on boarding)\n` +
    `Show your ref at the rank. Skip the queue!`
  );
}

/** Cancellation SMS */
function cancellationSMS(booking, route, slot) {
  return (
    `Q-Less Cancellation\n` +
    `Ref: ${booking.booking_ref} has been cancelled.\n` +
    `Route: ${route.from_place} → ${route.to_place} at ${slot.departure_time.slice(0,5)}\n` +
    `Book again at qless.co.za`
  );
}

module.exports = { sendSMS, bookingConfirmationSMS, cancellationSMS };
