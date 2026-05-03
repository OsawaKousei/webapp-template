import { z } from 'zod';

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

export const SaveReferenceSchema = z.object({
  id: z.number().int().min(1),
  quote: QuoteSchema,
  content: z.string().min(1),
  object_url: z.string().optional(),
});

export const ReferenceSchema = SaveReferenceSchema.extend({
  reportId: z.string().min(1),
});

export const ReportSchema = z.object({
  reportId: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
  references: z.array(ReferenceSchema),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const SaveReportCommandSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
  references: z.array(SaveReferenceSchema),
});

export type QuoteReferenceType = z.infer<typeof QuoteReferenceTypeSchema>;
export type Quote = z.infer<typeof QuoteSchema>;
export type SaveReference = z.infer<typeof SaveReferenceSchema>;
export type Reference = z.infer<typeof ReferenceSchema>;
export type Report = z.infer<typeof ReportSchema>;
export type SaveReportCommand = z.infer<typeof SaveReportCommandSchema>;
