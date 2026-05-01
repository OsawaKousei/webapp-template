import { z } from 'zod';

// Zodスキーマの定義（バリデーション用）
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  status: z.enum(['active', 'inactive']),
});

// TypeScriptの型定義（型推論用）
export type User = z.infer<typeof UserSchema>;