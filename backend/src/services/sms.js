/**
 * Africa's Talking SMS.
 * Enable with SMS_ENABLED=true and set AT_USERNAME + AT_API_KEY.
 * Sandbox: AT_USERNAME=sandbox + sandbox API key (Settings → API Key in sandbox app).
 * Live: your app username + live API key (not "sandbox").
 *
 * Sandbox does NOT deliver to real handsets — open
 * https://simulator.africastalking.com:1517 and register the same number there.
 */

let atSms;
let loadedCredsKey = '';

function credsFingerprint() {
  return `${process.env.AT_USERNAME || ''}|${process.env.AT_API_KEY || ''}`;
}

/** Normalize to E.164-ish (+…). Ethiopian local 09… → +2519… */
export function normalizePhone(raw) {
  if (!raw) return '';
  let digits = String(raw).trim().replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) {
    return `+${digits.slice(1).replace(/\D/g, '')}`;
  }
  digits = digits.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) {
    return `+251${digits.slice(1)}`;
  }
  if (digits.startsWith('251') && digits.length >= 12) {
    return `+${digits}`;
  }
  if (digits.length >= 9) {
    return `+${digits}`;
  }
  return '';
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientNetworkError(err) {
  const code = err?.code || err?.cause?.code || '';
  const msg = String(err?.message || '');
  return (
    ['ENOTFOUND', 'EAI_AGAIN', 'ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'UND_ERR_CONNECT_TIMEOUT'].includes(
      code
    ) ||
    /ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNRESET|getaddrinfo|network/i.test(msg)
  );
}

function extractAtError(err) {
  if (err?.response?.data != null) {
    return typeof err.response.data === 'string'
      ? err.response.data
      : JSON.stringify(err.response.data);
  }
  return err?.message || String(err);
}

/** Treat AT "Success" / statusCode 100–101 as delivered to their queue. */
function interpretAtResponse(response) {
  const recipients = response?.SMSMessageData?.Recipients;
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return { ok: true, response };
  }
  const failed = recipients.filter((r) => {
    const status = String(r.status || '').toLowerCase();
    return status && status !== 'success';
  });
  if (failed.length) {
    return {
      ok: false,
      response,
      error: failed.map((r) => `${r.number}: ${r.status}`).join('; '),
    };
  }
  return { ok: true, response };
}

async function loadAtSms() {
  const fingerprint = credsFingerprint();
  if (atSms !== undefined && fingerprint === loadedCredsKey) return atSms;

  loadedCredsKey = fingerprint;
  const username = (process.env.AT_USERNAME || '').trim();
  const apiKey = (process.env.AT_API_KEY || '').trim();
  if (!username || !apiKey) {
    atSms = null;
    return null;
  }

  const mod = await import('africastalking');
  const AfricasTalking = mod.default || mod;
  const client = AfricasTalking({ apiKey, username });
  atSms = client.SMS;
  return atSms;
}

/**
 * @returns {{ ok: boolean, channel: string, error?: string, skipped?: boolean, response?: unknown }}
 */
export async function sendSms({ to, message }) {
  if (process.env.SMS_ENABLED !== 'true') {
    return { ok: true, channel: 'disabled', skipped: true };
  }

  const phone = normalizePhone(to);
  if (!phone || !message) {
    return { ok: false, channel: 'none', error: 'Missing to or message' };
  }

  const sms = await loadAtSms();
  if (!sms) {
    console.log('[sms:console]', { to: phone, message });
    return { ok: true, channel: 'console' };
  }

  const options = {
    to: [phone],
    message: String(message).slice(0, 480),
  };
  if (process.env.AT_SENDER_ID) {
    options.from = process.env.AT_SENDER_ID;
  }

  const maxAttempts = Number(process.env.SMS_RETRY_ATTEMPTS || 3);
  let lastError = '';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await sms.send(options);
      console.log("[sms] Africa's Talking response:", JSON.stringify(response));
      const interpreted = interpretAtResponse(response);
      if (!interpreted.ok) {
        console.warn('[sms] recipient failure:', interpreted.error);
        return { ok: false, channel: 'africastalking', error: interpreted.error, response };
      }
      return { ok: true, channel: 'africastalking', response };
    } catch (err) {
      lastError = extractAtError(err);
      if (isTransientNetworkError(err) && attempt < maxAttempts) {
        const waitMs = 400 * attempt;
        console.warn(
          `[sms] transient network error (attempt ${attempt}/${maxAttempts}): ${lastError}; retrying in ${waitMs}ms`
        );
        await sleep(waitMs);
        continue;
      }
      console.warn("[sms] Africa's Talking failed:", lastError);
      return { ok: false, channel: 'africastalking', error: lastError };
    }
  }

  return { ok: false, channel: 'africastalking', error: lastError || 'SMS send failed' };
}
