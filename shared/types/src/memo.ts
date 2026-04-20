// packages/types/src/memo.ts
import { z } from 'zod';

// AIコメントのスキーマ
export const aiCommentSchema = z.object({
  id: z.string().uuid(),
  memoId: z.string().uuid(),
  commentText: z.string(),
  createdAt: z.string().datetime(),
});
export type AiComment = z.infer<typeof aiCommentSchema>;

// メモ本体のスキーマ
export const memoSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().nullable().optional(), // フェーズ1では未ログインも許容
  title: z.string().min(1, "タイトルは必須です").max(100, "タイトルは100文字以内で入力してください"),
  content: z.string().min(1, "本文は必須です"),
  aiComment: aiCommentSchema.optional(), // 結合して返す場合用
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Memo = z.infer<typeof memoSchema>;

// APIリクエスト用 (作成・更新時)
export const createMemoRequestSchema = memoSchema.pick({ title: true, content: true });
export type CreateMemoRequest = z.infer<typeof createMemoRequestSchema>;