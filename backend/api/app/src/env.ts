import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z
    .union([z.literal('development'), z.literal('test'), z.literal('production')])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse(process.env);