import { z } from 'zod';

export const ReportSummarySchema = z.object({
  reportId: z.string().min(1),
  title: z.string().min(1),
  lastModifiedAt: z.string().min(1),
});

export const ReportSummaryListSchema = z.array(ReportSummarySchema);

export const OutlineItemSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  order: z.number().int().min(1),
});

export const OutlineSchema = z.object({
  userId: z.string().min(1),
  overview: z.string().trim().min(1),
  title: z.string().trim().min(1),
  items: z.array(OutlineItemSchema).min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const AiModeSchema = z.union([z.literal('speed'), z.literal('turbo')]);

export const WordCountRangeSchema = z.object({
  minWordCount: z.number().int().min(0),
  maxWordCount: z.number().int().min(0),
}).refine(
  (value) => value.maxWordCount >= value.minWordCount,
  {
    message: 'maxWordCount must be greater than or equal to minWordCount',
    path: ['maxWordCount'],
  },
);

export const GenerateOutlineRequestSchema = z.object({
  overview: z.string().trim().min(1),
  aiMode: AiModeSchema,
  wordCount: WordCountRangeSchema,
  overwriteExisting: z.boolean().optional(),
});

export const GeneratedOutlineSchema = z.object({
  items: z.array(OutlineItemSchema).min(1),
});

export const GenerateOutlineResponseSchema = z.object({
  title: z.string().min(1),
  outline: GeneratedOutlineSchema,
});

export const DeleteOutlineResponseSchema = z.object({
  success: z.literal(true),
});

export type ReportSummary = z.infer<typeof ReportSummarySchema>;
export type OutlineItem = z.infer<typeof OutlineItemSchema>;
export type Outline = z.infer<typeof OutlineSchema>;
export type AiMode = z.infer<typeof AiModeSchema>;
export type WordCountRange = z.infer<typeof WordCountRangeSchema>;
export type GenerateOutlineRequest = z.infer<typeof GenerateOutlineRequestSchema>;
export type GenerateOutlineResponse = z.infer<typeof GenerateOutlineResponseSchema>;
