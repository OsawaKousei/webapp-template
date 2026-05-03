import { z } from 'zod';

const IsoDateTimeStringSchema = z.string().datetime({ offset: true });

export const ReportSummarySchema = z.object({
  reportId: z.string().min(1),
  title: z.string().min(1),
  lastModifiedAt: IsoDateTimeStringSchema,
});

export const ReportSummaryListSchema = z.array(ReportSummarySchema);

export const OutlineItemSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  order: z.number().int().min(1),
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

export const SaveReferenceSchema = z.object({
  id: z.number().int().min(1),
  quote: QuoteSchema,
  content: z.string().min(1),
  object_url: z.string().optional(),
});

export const ReferenceSchema = SaveReferenceSchema.extend({
  reportId: z.string().min(1),
});

export const ReportDetailSchema = z.object({
  reportId: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
  references: z.array(ReferenceSchema),
  createdAt: IsoDateTimeStringSchema,
  updatedAt: IsoDateTimeStringSchema,
});

export const SaveReportRequestSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().trim().min(1),
  references: z.array(SaveReferenceSchema).default([]),
});
export const SaveReportByBodyRequestSchema = SaveReportRequestSchema.extend({
  reportId: z.string().min(1),
}).passthrough();
export const SaveReportResponseSchema = ReportDetailSchema;
export const FetchUserReportsResponseSchema = ReportSummaryListSchema;
export const DeleteReportRequestSchema = z.object({
  reportId: z.string().min(1),
});
export const DeleteReportResponseSchema = z.object({
  deleted: z.boolean().optional(),
});

export type ReportSummary = z.infer<typeof ReportSummarySchema>;
export type OutlineItem = z.infer<typeof OutlineItemSchema>;
export type QuoteReferenceType = z.infer<typeof QuoteReferenceTypeSchema>;
export type Quote = z.infer<typeof QuoteSchema>;
export type SaveReference = z.infer<typeof SaveReferenceSchema>;
export type Reference = z.infer<typeof ReferenceSchema>;
export type ReportDetail = z.infer<typeof ReportDetailSchema>;
export type SaveReportRequest = z.infer<typeof SaveReportRequestSchema>;
export type SaveReportByBodyRequest = z.infer<
  typeof SaveReportByBodyRequestSchema
>;
export type SaveReportResponse = z.infer<typeof SaveReportResponseSchema>;
export type FetchUserReportsResponse = z.infer<
  typeof FetchUserReportsResponseSchema
>;
export type DeleteReportRequest = z.infer<typeof DeleteReportRequestSchema>;
export type DeleteReportResponse = z.infer<typeof DeleteReportResponseSchema>;
