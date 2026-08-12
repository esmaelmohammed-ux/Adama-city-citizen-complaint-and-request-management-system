import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const from = () => process.env.EMAIL_FROM || 'Adama Citizen Portal <onboarding@resend.dev>';

let resendClient;
function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

let smtpTransport;
function getSmtp() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  if (!smtpTransport) {
    smtpTransport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return smtpTransport;
}

/**
 * Send email via Resend → SMTP → console fallback.
 * Never throws to callers that prefer fire-and-forget; returns { ok, channel, error? }.
 */
export async function sendEmail({ to, subject, html, text }) {
  if (!to) {
    return { ok: false, channel: 'none', error: 'Missing recipient' };
  }

  const payload = {
    from: from(),
    to: Array.isArray(to) ? to : [to],
    subject,
    html: html || undefined,
    text: text || (html ? undefined : subject),
  };

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
      return { ok: false, channel: 'resend', error: err.message };
    }
  }

  const smtp = getSmtp();
  if (smtp) {
    try {
      await smtp.sendMail({
        from: payload.from,
        to: payload.to.join(', '),
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      });
      return { ok: true, channel: 'smtp' };
    } catch (err) {
      console.warn('[email] SMTP failed:', err.message);
      return { ok: false, channel: 'smtp', error: err.message };
    }
  }

  console.log('[email:console]', {
    to: payload.to,
    subject: payload.subject,
    text: payload.text || '(html body)',
  });
  return { ok: true, channel: 'console' };
}
