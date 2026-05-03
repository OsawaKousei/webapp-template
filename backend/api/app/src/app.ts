import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import type { Logger } from 'pino';
import { createAiRouter } from './features/ai/ai-router';
import type { ReferenceRepository } from './features/report/reference-repo';
import type { ReportRepository } from './features/report/report-repo';
import { createReportRouter } from './features/report/report-router';
import type { UserRepository } from './features/user/user-repo';
import { createUserRouter } from './features/user/user-router';

type CreateAppInput = {
  readonly logger: Logger;
  readonly referenceRepository: ReferenceRepository;
  readonly reportRepository: ReportRepository;
  readonly userRepository: UserRepository;
};

export const createApp = ({
  logger,
  referenceRepository,
  reportRepository,
  userRepository,
}: CreateAppInput): OpenAPIHono => {
  const app = new OpenAPIHono();

  app.use('*', async (context, next) => {
    const requestId = crypto.randomUUID();
    const startedAt = Date.now();

    await next();

    const durationMs = Date.now() - startedAt;

    context.header('x-request-id', requestId);

    logger.info(
      {
        requestId,
        method: context.req.method,
        path: context.req.path,
        status: context.res.status,
        durationMs,
      },
      'request completed',
    );
  });

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
  const reportRouter = createReportRouter({
    reportRepository,
    referenceRepository,
  });
  const aiRouter = createAiRouter({ reportRepository });

  app.route('/api', userRouter);
  app.route('/api', reportRouter);
  app.route('/api', aiRouter);

  return app;
};
