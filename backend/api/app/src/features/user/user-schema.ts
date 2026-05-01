import { z } from '@hono/zod-openapi';

export const UserStatusSchema = z.union([z.literal('active'), z.literal('inactive')]);

export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  status: UserStatusSchema,
});

export const GetUserParamSchema = z.object({
  userId: z.string().min(1),
});

export const ErrorResponseSchema = z.object({
  error: z.string().min(1),
});

export type User = z.infer<typeof UserSchema>;
export type GetUserParam = z.infer<typeof GetUserParamSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;