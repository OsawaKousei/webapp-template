import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { z } from 'zod';
import { match } from 'ts-pattern';
import type { ReportRepository } from './report-repo';
import {
  deleteMyOutline,
  getMyOutline,
  getMyReportById,
  saveMyReportById,
} from './report-service';
import {
  DeleteOutlineResponseSchema,
  ErrorResponseSchema,
  OutlineSchema,
  ReportDetailSchema,
  SaveReportRequestSchema,
} from './report-schema';

type CreateReportRouterInput = {
  readonly reportRepository: ReportRepository;
};

const NullableOutlineSchema = z.union([OutlineSchema, z.null()]);
const ReportIdParamSchema = z.object({
  reportId: z.string().min(1),
});

const getOutlineRoute = createRoute({
  method: 'get',
  path: '/reports/outline',
  responses: {
    200: {
      description: 'Current Outline Or Null',
      content: {
        'application/json': {
          schema: NullableOutlineSchema,
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

const deleteOutlineRoute = createRoute({
  method: 'delete',
  path: '/reports/outline',
  responses: {
    200: {
      description: 'Deleted',
      content: {
        'application/json': {
          schema: DeleteOutlineResponseSchema,
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
}: CreateReportRouterInput): OpenAPIHono => {
  const reportRouter = new OpenAPIHono();

  reportRouter.openapi(getOutlineRoute, async (context) => {
    const outlineResult = await getMyOutline({ reportRepository });

    return match(outlineResult)
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

  reportRouter.openapi(deleteOutlineRoute, async (context) => {
    const deleteResult = await deleteMyOutline({ reportRepository });

    return match(deleteResult)
      .when(
        (result) => result.isOk(),
        () => {
          return context.json({ success: true }, 200);
        },
      )
      .otherwise((result) => {
        if (result.isErr()) {
          return context.json({ error: result.error.message }, 500);
        }

        return context.json({ error: 'Internal Server Error' }, 500);
      });
  });

  reportRouter.openapi(getReportByIdRoute, async (context) => {
    const { reportId } = context.req.valid('param');
    const reportResult = await getMyReportById({
      reportRepository,
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
