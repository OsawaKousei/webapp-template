import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import type { UserRepository } from './features/user/user-repo';
import { createUserRouter } from './features/user/user-router';

type CreateAppInput = {
  readonly userRepository: UserRepository;
};

export const createApp = ({ userRepository }: CreateAppInput): OpenAPIHono => {
  const app = new OpenAPIHono();

  app.use(
    '/api/*',
    cors({
      origin: 'http://localhost:5173',
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    }),
  );

  app.get('/', (context) => {
    return context.text('Hello Hono Strict API');
  });

  const userRouter = createUserRouter({ userRepository });
  app.route('/api', userRouter);

  return app;
};