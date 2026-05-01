import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { match } from 'ts-pattern';
import type { UserRepository } from './user-repo';
import { getCurrentUser } from './user-service';
import { ErrorResponseSchema, UserSchema } from './user-schema';

type CreateUserRouterInput = {
  readonly userRepository: UserRepository;
};

const getUserRoute = createRoute({
  method: 'get',
  path: '/user',
  responses: {
    200: {
      description: 'User',
      content: {
        'application/json': {
          schema: UserSchema,
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

export const createUserRouter = ({
  userRepository,
}: CreateUserRouterInput): OpenAPIHono => {
  const userRouter = new OpenAPIHono();

  userRouter.openapi(getUserRoute, async (context) => {
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

  return userRouter;
};