import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { match } from 'ts-pattern';
import type { UserRepository } from './user-repo';
import { getCurrentUser, getMyReports } from './user-service';
import {
  ErrorResponseSchema,
  ReportSummaryListSchema,
  UserProfileSchema,
} from './user-schema';

type CreateUserRouterInput = {
  readonly userRepository: UserRepository;
};

const getCurrentUserRoute = createRoute({
  method: 'get',
  path: '/users/me',
  responses: {
    200: {
      description: 'Current User',
      content: {
        'application/json': {
          schema: UserProfileSchema,
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

const getMyReportsRoute = createRoute({
  method: 'get',
  path: '/users/me/reports',
  responses: {
    200: {
      description: 'My Reports',
      content: {
        'application/json': {
          schema: ReportSummaryListSchema,
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

export const createUserRouter = ({
  userRepository,
}: CreateUserRouterInput): OpenAPIHono => {
  const userRouter = new OpenAPIHono();

  userRouter.openapi(getCurrentUserRoute, async (context) => {
    const userResult = await getCurrentUser({ userRepository });

    return match(userResult)
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

  userRouter.openapi(getMyReportsRoute, async (context) => {
    const reportsResult = await getMyReports({ userRepository });

    return match(reportsResult)
      .when(
        (result) => result.isOk(),
        (result) => {
          return context.json([...result.value], 200);
        },
      )
      .otherwise((result) => {
        if (result.isErr()) {
          return context.json({ error: result.error.message }, 500);
        }

        return context.json({ error: 'Internal Server Error' }, 500);
      });
  });

  return userRouter;
};