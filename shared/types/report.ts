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
});

export const GenerateReportResponseSchema = z.object({
  reportId: z.string().min(1),
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
});

export const QuoteReferenceTypeSchema = z.union([
  z.literal('book'),
  z.literal('article'),
  z.literal('website'),
]);

export const QuoteSchema = z.object({
  id: z.number().int().min(1),
  text: z.string().min(1),
  source: z.string().min(1),
  page: z.string().optional(),
  referenceType: QuoteReferenceTypeSchema.optional(),
  authors: z.string().optional(),
  title: z.string().optional(),
  year: z.string().optional(),
  publisher: z.string().optional(),
  journal: z.string().optional(),
  volume: z.string().optional(),
  issue: z.string().optional(),
  pages: z.string().optional(),
  url: z.string().optional(),
  accessDate: z.string().optional(),
});

export const ReferenceSchema = z.object({
  id: z.number().int().min(1),
  quote: QuoteSchema,
  content: z.string().min(1),
  object_url: z.string().optional(),
});

export const ReportDetailSchema = z.object({
  reportId: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
  references: z.array(ReferenceSchema),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const SaveReportRequestSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
  references: z.array(ReferenceSchema).optional().default([]),
});

export type ReportSummary = z.infer<typeof ReportSummarySchema>;
export type OutlineItem = z.infer<typeof OutlineItemSchema>;
export type AiMode = z.infer<typeof AiModeSchema>;
export type WordCountRange = z.infer<typeof WordCountRangeSchema>;
export type GenerateOutlineRequest = z.infer<
  typeof GenerateOutlineRequestSchema
>;
export type GenerateOutlineResponse = z.infer<
  typeof GenerateOutlineResponseSchema
>;
export type GenerateReportTone = z.infer<typeof GenerateReportToneSchema>;
export type GenerateReportRequest = z.infer<typeof GenerateReportRequestSchema>;
export type GenerateReportResponse = z.infer<
  typeof GenerateReportResponseSchema
>;
export type QuoteReferenceType = z.infer<typeof QuoteReferenceTypeSchema>;
export type Quote = z.infer<typeof QuoteSchema>;
export type Reference = z.infer<typeof ReferenceSchema>;
export type ReportDetail = z.infer<typeof ReportDetailSchema>;
export type SaveReportRequest = z.infer<typeof SaveReportRequestSchema>;
