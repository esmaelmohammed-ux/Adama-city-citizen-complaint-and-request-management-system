/**
 * Africa's Talking SMS — live (real phones) by default.
 *
 * Live: SMS_ENABLED=true, AT_USERNAME=<app username, not "sandbox">, AT_API_KEY=<live key>.
 * Create an app at https://account.africastalking.com , enable SMS, and add credits.
 * Optional AT_SENDER_ID must be an approved sender (otherwise omit it).
 *
 * Sandbox (simulator only): AT_USERNAME=sandbox — does not reach real handsets.
 */

let atSms;
let loadedCredsKey = '';

function credsFingerprint() {
  return `${process.env.AT_USERNAME || ''}|${process.env.AT_API_KEY || ''}`;
}

export function getSmsRuntime() {
  const enabled = process.env.SMS_ENABLED === 'true';
  const username = (process.env.AT_USERNAME || '').trim();
  const apiKey = (process.env.AT_API_KEY || '').trim();
  const senderId = (process.env.AT_SENDER_ID || '').trim();
  const sandbox = username.toLowerCase() === 'sandbox';

  let mode = 'disabled';
  if (enabled && username && apiKey) {
    mode = sandbox ? 'sandbox' : 'live';
  } else if (enabled) {
    mode = 'unconfigured';
  }

  return { enabled, username: username || null, hasApiKey: Boolean(apiKey), senderId: senderId || null, sandbox, mode };
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
  const runtime = getSmsRuntime();
  if (!runtime.enabled) {
    return { ok: true, channel: 'disabled', skipped: true };
  }

  const phone = normalizePhone(to);
  if (!phone || !message) {
    return { ok: false, channel: 'none', error: 'Missing to or message' };
  }

  if (runtime.sandbox) {
    const error =
      'AT_USERNAME=sandbox cannot send to real phones. Set your live Africa\'s Talking app username and live API key.';
    console.warn('[sms]', error);
    return { ok: false, channel: 'sandbox', error };
  }

  const sms = await loadAtSms();
  if (!sms) {
    const error = 'SMS is enabled but AT_USERNAME or AT_API_KEY is missing.';
    console.warn('[sms]', error);
    return { ok: false, channel: 'unconfigured', error };
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
