import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();
const apiTarget = process.env['API_TARGET'] || 'http://localhost:3001';


app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use('/api', (req, res) => {
  const requestUrl = new URL(req.originalUrl.replace(/^\/api/, ''), apiTarget);
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
      continue;
    }
    if (typeof value === 'string') {
      headers.set(key, value);
    }
  }

  const method = req.method.toUpperCase();
  const hasBody = !['GET', 'HEAD'].includes(method);

  fetch(requestUrl, {
    method,
    headers,
    body: hasBody ? req : undefined,
    duplex: hasBody ? 'half' : undefined,
  } as RequestInit)
    .then(async (response) => {
      res.status(response.status);
      response.headers.forEach((value, key) => res.setHeader(key, value));

      if (!response.body) {
        res.end();
        return;
      }

      const reader = response.body.getReader();
      const stream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            break;
          }
          res.write(Buffer.from(value));
        }
      };

      await stream();
    })
    .catch(() => {
      res.status(502).json({ message: 'API proxy error' });
    });
});

app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 3000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
