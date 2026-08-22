import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const from = () => process.env.EMAIL_FROM || 'Adama Citizen Portal <onboarding@resend.dev>';

/** Demo/login addresses that cannot receive mail (no MX), e.g. officer@test.com. */
const SKIP_EMAIL_HOSTS = new Set([
  'test.com',
  'example.com',
  'example.org',
  'example.net',
  'localhost',
  'invalid',
]);

export function isDeliverableEmail(address) {
  const email = String(address || '').trim().toLowerCase();
  const at = email.lastIndexOf('@');
  if (at < 1) return false;
  const host = email.slice(at + 1);
  if (!host.includes('.')) return false;
  if (SKIP_EMAIL_HOSTS.has(host)) return false;
  if (host.endsWith('.test') || host.endsWith('.local') || host.endsWith('.invalid')) {
    return false;
  }
  return true;
}

function recipientsOf(to) {
  return (Array.isArray(to) ? to : [to]).map((item) => String(item || '').trim()).filter(Boolean);
}

/** Prefer SMTP "from" when sending via Gmail/SMTP (must match authenticated mailbox). */
function smtpFrom() {
  if (process.env.SMTP_FROM) return process.env.SMTP_FROM;
  const user = (process.env.SMTP_USER || '').trim();
  if (user) return `Adama Citizen Portal <${user}>`;
  return from();
}

let resendClient;
function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

let smtpTransport;
let smtpTransportKey = '';
function getSmtp() {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  // Google App Passwords are often pasted with spaces — strip them
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
  if (!host || !user || !pass) return null;

  const key = `${host}|${user}|${pass}|${process.env.SMTP_PORT}|${process.env.SMTP_SECURE}`;
  if (!smtpTransport || key !== smtpTransportKey) {
    smtpTransportKey = key;
    smtpTransport = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
    });
  }
  return smtpTransport;
}

async function sendViaSmtp(payload) {
  const smtp = getSmtp();
  if (!smtp) return null;
  await smtp.sendMail({
    from: smtpFrom(),
    to: payload.to.join(', '),
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
  return { ok: true, channel: 'smtp' };
}

/**
 * Send email via Resend → SMTP → console fallback.
 * If Resend rejects (e.g. unverified domain / only own inbox), SMTP is tried next.
 */
export async function sendEmail({ to, subject, html, text }) {
  if (!to) {
    return { ok: false, channel: 'none', error: 'Missing recipient' };
  }

  const recipients = recipientsOf(to);
  if (recipients.length === 0) {
    return { ok: false, channel: 'none', error: 'Missing recipient' };
  }

  const undeliverable = recipients.filter((address) => !isDeliverableEmail(address));
  if (undeliverable.length) {
    console.log('[email] skipped undeliverable address', undeliverable.join(', '));
    return { ok: true, channel: 'skipped', skipped: true };
  }

  const payload = {
    from: from(),
    to: recipients,
    subject,
    html: html || undefined,
    text: text || (html ? undefined : subject),
  };

  // Prefer SMTP when EMAIL_PROVIDER=smtp (best for mailing all users without a Resend domain)
  const preferSmtp = (process.env.EMAIL_PROVIDER || '').toLowerCase() === 'smtp';

  if (preferSmtp) {
    try {
      const result = await sendViaSmtp(payload);
      if (result) return result;
      console.warn('[email] EMAIL_PROVIDER=smtp but SMTP is not configured');
    } catch (err) {
      console.warn('[email] SMTP failed:', err.message);
      return { ok: false, channel: 'smtp', error: err.message };
    }
  }

  const resend = getResend();
  if (resend) {
    try {
      const { error } = await resend.emails.send({
        from: payload.from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      });
      if (error) throw new Error(error.message || 'Resend error');
      return { ok: true, channel: 'resend' };
    } catch (err) {
      console.warn('[email] Resend failed:', err.message);
      try {
        const fallback = await sendViaSmtp(payload);
        if (fallback) {
          console.log('[email] fell back to SMTP after Resend failure');
          return fallback;
        }
      } catch (smtpErr) {
        console.warn('[email] SMTP fallback failed:', smtpErr.message);
        return { ok: false, channel: 'smtp', error: smtpErr.message };
      }
      return { ok: false, channel: 'resend', error: err.message };
    }
  }

  try {
    const result = await sendViaSmtp(payload);
    if (result) return result;
  } catch (err) {
    console.warn('[email] SMTP failed:', err.message);
    return { ok: false, channel: 'smtp', error: err.message };
  }

  console.log('[email:console]', {
    to: payload.to,
    subject: payload.subject,
    text: payload.text || '(html body)',
  });
  return { ok: true, channel: 'console' };
}
