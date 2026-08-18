import { sendEmail } from './email.js';
import { sendSms } from './sms.js';

/**
 * Fire-and-forget email + SMS for a user document (or lean object).
 * Never throws.
 */
export async function deliverUserChannels(user, { title, message }) {
  if (!user || user.isActive === false) return { email: null, sms: null };

  const results = { email: null, sms: null };

  if (user.email) {
    try {
      results.email = await sendEmail({
        to: user.email,
        subject: title,
        text: message,
        html: `<p>Hi ${user.fullName || 'there'},</p><p>${message}</p><p>— Adama City Citizen Portal</p>`,
      });
    } catch (err) {
      console.warn('[notify-email]', err.message);
      results.email = { ok: false, error: err.message };
    }
  }

  if (user.phoneNumber) {
    try {
      const smsBody = `${title}: ${message}`.slice(0, 320);
      results.sms = await sendSms({ to: user.phoneNumber, message: smsBody });
    } catch (err) {
      console.warn('[notify-sms]', err.message);
      results.sms = { ok: false, error: err.message };
    }
  }

  return results;
}
