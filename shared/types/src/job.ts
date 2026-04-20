// packages/types/src/job.ts
import { z } from 'zod';

export const JobStatusEnum = z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]);
export type JobStatus = z.infer<typeof JobStatusEnum>;

export const jobStatusSchema = z.object({
  jobId: z.string().uuid(),
  memoId: z.string().uuid(),
  status: JobStatusEnum,
  result: z.string().optional(), // 成功時のメッセージや、失敗時のエラー内容
  expiresAt: z.number(), // DynamoDBのTTL用 (UNIXエポック秒)
});
export type JobStatusRecord = z.infer<typeof jobStatusSchema>;

// AIコメントリクエストのレスポンス (202 Accepted で返す内容)
export const aiCommentJobResponseSchema = z.object({
  jobId: z.string().uuid(),
  status: z.literal("PENDING"),
  message: z.string(),
});
export type AiCommentJobResponse = z.infer<typeof aiCommentJobResponseSchema>;