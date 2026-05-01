import { handle } from 'hono/aws-lambda';
import { createApp } from './app';
import { env } from './env';
import { createLogger } from './infrastructure/logging/logger';
import { createInMemoryUserRepository } from './infrastructure/repositories/in-memory-user-repository';

const logger = createLogger({ level: env.LOG_LEVEL });
const userRepository = createInMemoryUserRepository();
const app = createApp({
  logger,
  userRepository,
});

if (env.NODE_ENV === 'development') {
  const { serve } = await import('@hono/node-server');
  serve({
    fetch: app.fetch,
    port: env.PORT,
  });
}

export const handler = handle(app);
