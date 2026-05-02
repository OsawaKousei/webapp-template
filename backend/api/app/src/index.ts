import { handle } from 'hono/aws-lambda';
import { createApp } from './app';
import { env } from './env';
import { createLogger } from './infrastructure/logging/logger';
import { createDatabaseClient } from './infrastructure/db/client';
import { createDrizzleReportRepository } from './infrastructure/repositories/drizzle-report-repository';
import { createDrizzleUserRepository } from './infrastructure/repositories/drizzle-user-repository';
import { createInMemoryReportRepository } from './infrastructure/repositories/in-memory-report-repository';
import { createInMemoryUserRepository } from './infrastructure/repositories/in-memory-user-repository';
import type { ReportRepository } from './features/report/report-repo';
import type { UserRepository } from './features/user/user-repo';

const logger = createLogger({ level: env.LOG_LEVEL });

const createRepositories = (): {
  readonly reportRepository: ReportRepository;
  readonly userRepository: UserRepository;
} => {
  if (env.USE_DRIZZLE_REPOSITORY !== true) {
    return {
      reportRepository: createInMemoryReportRepository(),
      userRepository: createInMemoryUserRepository(),
    };
  }

  if (env.DATABASE_URL === undefined) {
    return {
      reportRepository: createInMemoryReportRepository(),
      userRepository: createInMemoryUserRepository(),
    };
  }

  const db = createDatabaseClient({
    connectionString: env.DATABASE_URL,
  });

  return {
    reportRepository: createDrizzleReportRepository({ db }),
    userRepository: createDrizzleUserRepository({ db }),
  };
};

const { reportRepository, userRepository } = createRepositories();
const app = createApp({
  logger,
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
