import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { cors } from 'hono/cors';
import type { User } from '@my-app/types';

const app = new Hono();

app.use(
  '/api/*',
  cors({
    origin: 'http://localhost:5173', // フロントエンドのURLを許可
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.get('/api/user', (c) => {
  // 共有された User 型を適用
  const userData: User = {
    id: 'u123',
    name: 'Gemini Node',
    email: 'gemini@example.com',
    status: 'active',
  };
  return c.json(userData);
});

if (process.env.NODE_ENV === 'development') {
  // 動的インポートにより、Lambda本番環境に余計なモジュールを巻き込まない
  import('@hono/node-server').then(({ serve }) => {
    const port = 3000;

    serve({
      fetch: app.fetch,
      port,
    });
  });
}

export const handler = handle(app);
