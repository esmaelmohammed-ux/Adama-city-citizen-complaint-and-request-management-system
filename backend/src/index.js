import 'dotenv/config';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { getSmsRuntime } from './services/sms.js';

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required. Set it in backend/.env');
  }

  await connectDB();

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API base: http://localhost:${PORT}/api`);
    const sms = getSmsRuntime();
    if (sms.mode === 'live') {
      console.log(`[sms] Live Africa's Talking → real phones (username: ${sms.username})`);
    } else if (sms.mode === 'sandbox') {
      console.warn('[sms] Sandbox username — will not deliver to real phones.');
    } else if (sms.mode === 'unconfigured') {
      console.warn('[sms] SMS_ENABLED=true but AT_USERNAME / AT_API_KEY are missing.');
    } else {
      console.log('[sms] Disabled — set SMS_ENABLED=true and live AT credentials for real phones.');
    }
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
