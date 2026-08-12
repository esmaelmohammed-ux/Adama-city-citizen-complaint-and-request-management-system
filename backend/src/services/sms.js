/**
 * Africa's Talking SMS scaffold.
 * Gated by SMS_ENABLED=true — off by default for v1 (email-only notifications).
 */

let atSms;

async function loadAtSms() {
  if (atSms !== undefined) return atSms;
  const username = process.env.AT_USERNAME;
  const apiKey = process.env.AT_API_KEY;
  if (!username || !apiKey) {
    atSms = null;
    return null;
  }
  const AfricasTalking = (await import('africastalking')).default;
  const client = AfricasTalking({ apiKey, username });
  atSms = client.SMS;
  return atSms;
}

/**
 * @returns {{ ok: boolean, channel: string, error?: string, skipped?: boolean }}
 */
export async function sendSms({ to, message }) {
  if (process.env.SMS_ENABLED !== 'true') {
    return { ok: true, channel: 'disabled', skipped: true };
  }

  if (!to || !message) {
    return { ok: false, channel: 'none', error: 'Missing to or message' };
  }

  const phone = String(to).trim();
  const recipients = phone.startsWith('+') ? [phone] : [`+${phone.replace(/\D/g, '')}`];

  try {
    const sms = await loadAtSms();
    if (!sms) {
      console.log('[sms:console]', { to: recipients, message });
      return { ok: true, channel: 'console' };
    }

    const options = {
      to: recipients,
      message,
    };
    if (process.env.AT_SENDER_ID) {
      options.from = process.env.AT_SENDER_ID;
    }

    await sms.send(options);
    return { ok: true, channel: 'africastalking' };
  } catch (err) {
    console.warn('[sms] Africa\'s Talking failed:', err.message);
    return { ok: false, channel: 'africastalking', error: err.message };
  }
}
