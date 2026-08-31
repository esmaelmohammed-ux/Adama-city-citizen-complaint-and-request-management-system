import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const aiPort = process.env.AI_PORT || '5100';

const children = [];

function run(name, cwd, extraEnv = {}) {
  const child = spawn(process.execPath, ['src/index.js'], {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
  });
  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`[${name}] stopped (${signal})`);
      return;
    }
    if (code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      if (name === 'backend') process.exit(code ?? 1);
    }
  });
  children.push(child);
  return child;
}

run('ai', path.join(root, 'ai-service'), { PORT: aiPort });
run('backend', path.join(root, 'backend'), {
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || `http://127.0.0.1:${aiPort}`,
});

function shutdown(signal) {
  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
