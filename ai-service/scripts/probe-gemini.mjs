const started = Date.now();
const health = await fetch('http://localhost:5100/api/health').then((r) => r.json());
const cat = await fetch('http://localhost:5100/api/ai/categorize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Broken streetlight near stadium',
    description: 'The lamp has been dark for three nights.',
    location: 'Adama Stadium',
  }),
}).then((r) => r.json());
console.log(JSON.stringify({
  model: health.model,
  ms: Date.now() - started,
  provider: cat.provider,
  category: cat.category,
}));
