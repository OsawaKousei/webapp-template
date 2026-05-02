import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { match } from 'ts-pattern';
import type { ReportRepository } from '../report/report-repo';
import { generateOutline, generateReport } from './ai-service';
import {
  ErrorResponseSchema,
  GenerateReportRequestSchema,
  GenerateReportResponseSchema,
  GenerateOutlineRequestSchema,
  GenerateOutlineResponseSchema,
} from './ai-schema';

type CreateAiRouterInput = {
  readonly reportRepository: ReportRepository;
};

const generateOutlineRoute = createRoute({
  method: 'post',
  path: '/ai/generate-outline',
  request: {
    body: {
      content: {
        'application/json': {
          schema: GenerateOutlineRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Generated Outline',
      content: {
        'application/json': {
          schema: GenerateOutlineResponseSchema,
        },
      },
    },
    409: {
      description: 'Conflict',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

const generateReportRoute = createRoute({
  method: 'post',
  path: '/ai/generate-report',
  request: {
    body: {
      content: {
        'application/json': {
          schema: GenerateReportRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Generated Report',
      content: {
        'application/json': {
          schema: GenerateReportResponseSchema,
        },
      },
    },
    404: {
      description: 'Not Found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export const createAiRouter = ({
  reportRepository,
}: CreateAiRouterInput): OpenAPIHono => {
  const aiRouter = new OpenAPIHono();

  aiRouter.openapi(generateOutlineRoute, async (context) => {
    const request = context.req.valid('json');
    const outlineResult = await generateOutline({
      reportRepository,
      request,
    });

    return match(outlineResult)
      .when(
        (result) => result.isOk(),
        (result) => {
          return context.json(result.value, 200);
        },
      )
      .when(
        (result) => result.isErr() && result.error.type === 'CONFLICT',
        (result) => {
          return context.json({ error: result.error.message }, 409);
        },
      )
      .otherwise((result) => {
        if (result.isErr()) {
          return context.json({ error: result.error.message }, 500);
        }

        return context.json({ error: 'Internal Server Error' }, 500);
      });
  });

  aiRouter.openapi(generateReportRoute, async (context) => {
    const request = context.req.valid('json');
    const reportResult = await generateReport({
      reportRepository,
      request,
    });

    return match(reportResult)
      .when(
        (result) => result.isOk(),
        (result) => {
          return context.json(result.value, 200);
        },
      )
      .when(
        (result) => result.isErr() && result.error.type === 'NOT_FOUND',
        (result) => {
          return context.json({ error: result.error.message }, 404);
        },
      )
      .otherwise((result) => {
        if (result.isErr()) {
          return context.json({ error: result.error.message }, 500);
        }

        return context.json({ error: 'Internal Server Error' }, 500);
      });
  });

  return aiRouter;
};
