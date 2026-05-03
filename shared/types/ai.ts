import { z } from 'zod';
import { OutlineItemSchema } from './report';

export const AiModeSchema = z.union([z.literal('speed'), z.literal('turbo')]);

export const WordCountRangeSchema = z
  .object({
    minWordCount: z.number().int().min(0),
    maxWordCount: z.number().int().min(0),
  })
  .refine((value) => value.maxWordCount >= value.minWordCount, {
    message: 'maxWordCount must be greater than or equal to minWordCount',
    path: ['maxWordCount'],
  });

export const GenerateOutlineRequestSchema = z.object({
  overview: z.string().trim().min(1),
  aiMode: AiModeSchema,
  wordCount: WordCountRangeSchema,
  reference_ids: z.array(z.string().min(1)).default([]),
  overview_reference_id: z.string().min(1).nullable().default(null),
});

export const GeneratedOutlineSchema = z.object({
  items: z.array(OutlineItemSchema).min(1),
});

export const GenerateOutlineResponseSchema = z.object({
  title: z.string().min(1),
  outline: GeneratedOutlineSchema,
});

export const GenerateReportToneSchema = z.union([
  z.literal('formal'),
  z.literal('balanced'),
  z.literal('casual'),
]);

export const GenerateReportRequestSchema = z.object({
  overview: z.string().trim().min(1),
  tone: GenerateReportToneSchema,
  reference_ids: z.array(z.string().min(1)).default([]),
  overview_reference_id: z.string().min(1).nullable().default(null),
});

export const GenerateReportResponseSchema = z.object({
  reportId: z.string().min(1),
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
});

export type AiMode = z.infer<typeof AiModeSchema>;
export type WordCountRange = z.infer<typeof WordCountRangeSchema>;
export type GenerateOutlineRequest = z.infer<typeof GenerateOutlineRequestSchema>;
export type GenerateOutlineResponse = z.infer<typeof GenerateOutlineResponseSchema>;
export type GenerateReportTone = z.infer<typeof GenerateReportToneSchema>;
export type GenerateReportRequest = z.infer<typeof GenerateReportRequestSchema>;
export type GenerateReportResponse = z.infer<typeof GenerateReportResponseSchema>;
