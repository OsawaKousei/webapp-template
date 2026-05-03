import { z } from 'zod';
import { requestJsonAsync } from '@/shared/api';

const reportDetailSchema = z.object({
  reportId: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
});

const referenceItemSchema = z.object({
  referenceId: z.string().min(1),
  title: z.string().min(1),
  authors: z.string().optional(),
  year: z.string().optional(),
  citation: z.string().optional(),
});

const referenceListSchema = z.array(referenceItemSchema);

const chatResponseSchema = z.object({
  message: z.string().min(1),
});

const referenceSearchResultSchema = z.array(
  z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    title: z.string().min(1),
    authors: z.string().optional(),
    year: z.string().optional(),
    abstract: z.string().optional(),
  }),
);

const emptySchema = z.object({
  success: z.boolean().optional(),
});

type ReportDetail = z.infer<typeof reportDetailSchema>;
type ReferenceItem = z.infer<typeof referenceItemSchema>;
type ChatMessage = {
  readonly role: 'user' | 'assistant';
  readonly content: string;
};
type ReferenceSearchResult = z.infer<typeof referenceSearchResultSchema>[number];

export const fetchReportDetailAsync = async (
  reportId: string,
): Promise<ReportDetail> => {
  return requestJsonAsync(
    {
      path: `/api/reports/${encodeURIComponent(reportId)}`,
    },
    reportDetailSchema,
  );
};

export const saveReportAsync = async (args: {
  readonly reportId: string;
  readonly title: string;
  readonly content: string;
}) => {
  await requestJsonAsync(
    {
      path: '/api/report',
      method: 'POST',
      body: {
        reportId: args.reportId,
        title: args.title,
        content: args.content,
      },
    },
    emptySchema,
  );
};

export const fetchReferencesAsync = async (
  reportId: string,
): Promise<readonly ReferenceItem[]> => {
  return requestJsonAsync(
    {
      path: `/api/report/reference?reportId=${encodeURIComponent(reportId)}`,
    },
    referenceListSchema,
  );
};

export const createReferenceAsync = async (args: {
  readonly reportId: string;
  readonly title: string;
}) => {
  return requestJsonAsync(
    {
      path: '/api/report/reference',
      method: 'POST',
      body: {
        reportId: args.reportId,
        title: args.title,
      },
    },
    referenceItemSchema,
  );
};

export const deleteReferenceAsync = async (referenceId: string) => {
  await requestJsonAsync(
    {
      path: `/api/report/reference?referenceId=${encodeURIComponent(referenceId)}`,
      method: 'DELETE',
    },
    emptySchema,
  );
};

export const chatAsync = async (args: {
  readonly reportId: string;
  readonly mode: string;
  readonly messages: readonly ChatMessage[];
}) => {
  const response = await requestJsonAsync(
    {
      path: '/api/ai/chat',
      method: 'POST',
      body: {
        reportId: args.reportId,
        mode: args.mode,
        messages: args.messages,
      },
    },
    chatResponseSchema,
  );

  return response.message;
};

export const searchReferenceAsync = async (args: {
  readonly reportId: string;
  readonly query: string;
}) => {
  const response = await requestJsonAsync(
    {
      path: '/api/ai/reference_search',
      method: 'POST',
      body: {
        reportId: args.reportId,
        query: args.query,
      },
    },
    referenceSearchResultSchema,
  );

  return response;
};

export const exportReportAsync = async (args: {
  readonly reportId: string;
  readonly format: 'txt' | 'html';
}) => {
  await requestJsonAsync(
    {
      path: '/api/export',
      method: 'POST',
      body: {
        reportId: args.reportId,
        format: args.format,
      },
    },
    emptySchema,
  );
};

export type { ChatMessage, ReferenceItem, ReferenceSearchResult, ReportDetail };
