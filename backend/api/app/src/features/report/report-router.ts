import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { z } from 'zod';
import { match } from 'ts-pattern';
import type { ReferenceRepository } from './reference-repo';
import type { ReportRepository } from './report-repo';
import { getMyReportById, saveMyReportById } from './report-service';
import {
  ErrorResponseSchema,
  ReportDetailSchema,
  SaveReportRequestSchema,
} from './report-schema';

type CreateReportRouterInput = {
  readonly reportRepository: ReportRepository;
  readonly referenceRepository: ReferenceRepository;
};

const ReportIdParamSchema = z.object({
  reportId: z.string().min(1),
});

const getReportByIdRoute = createRoute({
  method: 'get',
  path: '/reports/{reportId}',
  request: {
    params: ReportIdParamSchema,
  },
  responses: {
    200: {
      description: 'Report Detail',
      content: {
        'application/json': {
          schema: ReportDetailSchema,
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

const saveReportByIdRoute = createRoute({
  method: 'post',
  path: '/reports/{reportId}',
  request: {
    params: ReportIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: SaveReportRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Saved Report Detail',
      content: {
        'application/json': {
          schema: ReportDetailSchema,
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

export const createReportRouter = ({
  reportRepository,
  referenceRepository,
}: CreateReportRouterInput): OpenAPIHono => {
  const reportRouter = new OpenAPIHono();

  reportRouter.openapi(getReportByIdRoute, async (context) => {
    const { reportId } = context.req.valid('param');
    const reportResult = await getMyReportById({
      reportRepository,
      referenceRepository,
      reportId,
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

  reportRouter.openapi(saveReportByIdRoute, async (context) => {
    const { reportId } = context.req.valid('param');
    const request = context.req.valid('json');
    const saveResult = await saveMyReportById({
      reportRepository,
      referenceRepository,
      reportId,
      request,
    });

    return match(saveResult)
      .when(
        (result) => result.isOk(),
        (result) => {
          return context.json(result.value, 200);
        },
      )
      .otherwise((result) => {
        if (result.isErr()) {
          return context.json({ error: result.error.message }, 500);
        }

        return context.json({ error: 'Internal Server Error' }, 500);
      });
  });

  return reportRouter;
};
