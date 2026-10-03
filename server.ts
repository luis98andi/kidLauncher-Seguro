import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Universal CORS & Header Middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Serve Manifests and Service Worker explicitly with exact headers
app.all(['/manifest.json', '/manifest.webmanifest'], (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const manifestPath = path.resolve(__dirname, 'public/manifest.json');
  if (req.method === 'HEAD') {
    return res.status(200).end();
  }
  return res.sendFile(manifestPath);
});

app.all('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const swPath = path.resolve(__dirname, 'public/sw.js');
  if (req.method === 'HEAD') {
    return res.status(200).end();
  }
  return res.sendFile(swPath);
});

// Serve static assets from public folder
app.use(express.static(path.resolve(__dirname, 'public')));

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'));

  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.all('*', (req, res) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (req.method === 'HEAD') return res.status(200).end();
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    // Development mode using Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const viteDevServer = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Handle HEAD requests specifically for PWABuilder before Vite middleware
    app.use((req, res, next) => {
      if (req.method === 'HEAD' && (req.path === '/' || req.path === '/index.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).end();
      }
      next();
    });

    app.use(viteDevServer.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
