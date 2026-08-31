import 'dotenv/config';

const key = (process.env.GEMINI_API_KEY || '').trim();
const models = ['gemini-3.1-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.5-flash'];
const body = JSON.stringify({
  contents: [{ parts: [{ text: 'Reply JSON {"ok":true}' }] }],
  generationConfig: { temperature: 0, responseMimeType: 'application/json' },
});

for (const model of models) {
  const started = Date.now();
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body,
    }
  );
  const t = await res.text();
  console.log(model, res.status, `${Date.now() - started}ms`, t.slice(0, 120).replace(/\s+/g, ' '));
}
