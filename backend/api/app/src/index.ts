import { handle } from 'hono/aws-lambda';
import { createApp } from './app';
import { env } from './env';
import { createLogger } from './infrastructure/logging/logger';
import { createDatabaseClient } from './infrastructure/db/client';
import { createDrizzleReferenceRepository } from './infrastructure/repositories/drizzle-reference-repository';
import { createDrizzleReportRepository } from './infrastructure/repositories/drizzle-report-repository';
import { createDrizzleUserRepository } from './infrastructure/repositories/drizzle-user-repository';

const DEFAULT_DATABASE_URL = 'postgres://local:password@db:5432/myapp';

const logger = createLogger({ level: env.LOG_LEVEL });

const createRepositories = () => {
  const connectionString = env.DATABASE_URL ?? DEFAULT_DATABASE_URL;

  if (env.DATABASE_URL === undefined) {
    logger.warn(
      `DATABASE_URL is not set. Falling back to ${DEFAULT_DATABASE_URL}.`,
    );
  }

  const db = createDatabaseClient({ connectionString });

  return {
    referenceRepository: createDrizzleReferenceRepository({ db }),
    reportRepository: createDrizzleReportRepository({ db }),
    userRepository: createDrizzleUserRepository({ db }),
  };
};

const { referenceRepository, reportRepository, userRepository } =
  createRepositories();
const app = createApp({
  logger,
  referenceRepository,
  reportRepository,
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
