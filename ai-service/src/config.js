import 'dotenv/config';

function buildMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_CLUSTER, MONGODB_DB } = process.env;
  if (MONGODB_USER && MONGODB_PASSWORD && MONGODB_CLUSTER) {
    const db = MONGODB_DB || 'adama_citizen';
    return `mongodb+srv://${encodeURIComponent(MONGODB_USER)}:${encodeURIComponent(MONGODB_PASSWORD)}@${MONGODB_CLUSTER}/${db}?retryWrites=true&w=majority&appName=Cluster0&authSource=admin`;
  }
  return '';
}

const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

export const config = {
  port: Number(process.env.PORT) || 5100,
  provider,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  mongoUri: buildMongoUri(),
};

export function resolveEffectiveProvider() {
  if (config.provider === 'heuristic') return 'heuristic';
  if (config.provider === 'openai' && config.openaiApiKey) return 'openai';
  if (config.provider === 'gemini' && config.geminiApiKey) return 'gemini';
  if (config.openaiApiKey) return 'openai';
  if (config.geminiApiKey) return 'gemini';
  return 'heuristic';
}
