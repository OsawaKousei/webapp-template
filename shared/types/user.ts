import { z } from 'zod';

export const SubscriptionPlanSchema = z.union([
  z.literal('standard'),
  z.literal('plus'),
  z.literal('pro'),
]);

export const UserProfileSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  email: z.string().email(),
  subscriptionPlan: SubscriptionPlanSchema,
  credits: z.number().int().min(0),
});

export const ErrorResponseSchema = z.object({
  error: z.string().min(1),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
