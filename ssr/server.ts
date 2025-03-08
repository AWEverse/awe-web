import express from 'express';
import { createServer as createViteServer } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

async function createServer() {
  const app = express();
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  app.use(vite.middlewares);

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl;

      // Read and transform index.html
      let template = fs.readFileSync(resolve('index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);

      // Load the server entry and render the app
      const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');
      const appHtml = render(url);

      // Inject rendered HTML into the template
      const html = template.replace(`<!--ssr-outlet-->`, appHtml);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      res.status(500).end(e.message);
    }
  });

  app.listen(5173, () => console.log('Server running at http://localhost:5173'));
}

createServer();
