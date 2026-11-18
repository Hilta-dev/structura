import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { handleTutor, validate } from './api/tutor.ts';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-tutor-dev',
        configureServer(server) {
          server.middlewares.use('/api/tutor', async (req, res, next) => {
            if (req.method === 'OPTIONS') {
              res.writeHead(204);
              res.end();
              return;
            }
            if (req.method !== 'POST') { next(); return; }

            const chunks: Buffer[] = [];
            req.on('data', (c: Buffer) => chunks.push(c));
            req.on('end', async () => {
              let body: unknown;
              try { body = JSON.parse(Buffer.concat(chunks).toString()); }
              catch {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON.' }));
                return;
              }

              if (!validate(body)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid request.' }));
                return;
              }

              const apiKey = env.MODEL_API_KEY ?? '';
              const model  = env.MODEL_NAME   ?? 'muse-spark-1.2';

              if (!apiKey) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'API key not configured.' }));
                return;
              }

              const result = await handleTutor(body, apiKey, model);
              const status = 'error' in result ? 502 : 200;
              res.writeHead(status, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(result));
            });
          });
        },
      },
    ],
  };
});
