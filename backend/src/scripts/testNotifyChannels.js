/**
 * One-off channel smoke test: node src/scripts/testNotifyChannels.js
 * Optional: node src/scripts/testNotifyChannels.js +2519XXXXXXXX
 */
import 'dotenv/config';
import { sendEmail } from '../services/email.js';
import { sendSms } from '../services/sms.js';

const phone = process.argv[2] || '+251911000001';

console.log('Config check:');
console.log('  SMS_ENABLED =', process.env.SMS_ENABLED);
console.log('  AT_USERNAME =', process.env.AT_USERNAME);
console.log('  AT_API_KEY  =', process.env.AT_API_KEY ? `(set, ${process.env.AT_API_KEY.slice(0, 8)}…)` : '(missing)');
console.log('  RESEND_KEY  =', process.env.RESEND_API_KEY ? '(set)' : '(missing)');
console.log('  EMAIL_FROM  =', process.env.EMAIL_FROM);
console.log('  test phone  =', phone);
console.log('');

const emailResult = await sendEmail({
  to: process.env.TEST_EMAIL || 'esmael6360@gmail.com',
  subject: 'Adama portal — email channel test',
  text: 'If you received this, Resend/email is working.',
  html: '<p>If you received this, <strong>Resend/email</strong> is working.</p>',
});
console.log('Email result:', emailResult);

const smsResult = await sendSms({
  to: phone,
  message: 'Adama Citizen Portal SMS test. If you see this in the AT sandbox simulator, SMS works.',
});
console.log('SMS result:', smsResult);

if (smsResult.skipped) {
  console.log('\nSMS was skipped — set SMS_ENABLED=true in backend/.env and re-run.');
} else if (smsResult.channel === 'africastalking' && smsResult.ok) {
  console.log('\nSMS accepted by Africa\'s Talking.');
  console.log('Open simulator: https://simulator.africastalking.com:1517');
  console.log('Register the same number there (e.g. +251911000001) to see the message.');
} else if (!smsResult.ok) {
  console.log('\nSMS failed:', smsResult.error);
  process.exitCode = 1;
}
