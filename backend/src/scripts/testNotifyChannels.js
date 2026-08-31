/**
 * One-off channel smoke test: node src/scripts/testNotifyChannels.js
 * Optional: node src/scripts/testNotifyChannels.js +2519XXXXXXXX
 */
import 'dotenv/config';
import { sendEmail } from '../services/email.js';
import { getSmsRuntime, sendSms } from '../services/sms.js';

const phone = process.argv[2] || '+251911000001';

const smsRuntime = getSmsRuntime();
console.log('Config check:');
console.log('  SMS_ENABLED =', process.env.SMS_ENABLED);
console.log('  SMS mode    =', smsRuntime.mode);
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
  message: 'Adama Citizen Portal SMS test. If you received this on your phone, live SMS is working.',
});
console.log('SMS result:', smsResult);

if (smsResult.skipped) {
  console.log('\nSMS was skipped — set SMS_ENABLED=true and live AT_USERNAME / AT_API_KEY in backend/.env.');
} else if (smsResult.channel === 'africastalking' && smsResult.ok) {
  console.log('\nSMS accepted by Africa\'s Talking (live). Check the real handset.');
} else if (!smsResult.ok) {
  console.log('\nSMS failed:', smsResult.error);
  process.exitCode = 1;
}
