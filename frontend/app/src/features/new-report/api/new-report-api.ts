import { z } from 'zod';
import {
  requestJsonAsync,
  uploadFileAsync,
} from '@/shared/api';

const outlineItemSchema = z.object({
  order: z.number().int().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
});

const outlineResponseSchema = z.object({
  title: z.string().min(1),
  outline: z.object({
    items: z.array(outlineItemSchema),
  }),
});

const reportResponseSchema = z.object({
  reportId: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
});

const uploadSchema = z.object({
  referenceId: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().int().min(0).optional(),
});

const emptySchema = z.object({
  success: z.boolean().optional(),
});

type GenerateOutlineArgs = {
  readonly overview: string;
  readonly wordCount: string;
  readonly aiMode: string;
  readonly reference: readonly string[];
  readonly overviewReferenceId: string | null;
};

type GenerateReportArgs = {
  readonly reportId: string;
  readonly overview: string;
  readonly title: string;
  readonly outline: ReadonlyArray<{
    readonly order: number;
    readonly title: string;
    readonly summary: string;
  }>;
  readonly wordCount: string;
  readonly aiMode: string;
  readonly tone: string;
  readonly reference: readonly string[];
  readonly humanize: boolean;
};

const toGenerateReportTone = (tone: string): 'formal' | 'balanced' | 'casual' => {
  if (tone === 'dearu-da') {
    return 'formal';
  }

  if (tone === 'desu-masu') {
    return 'balanced';
  }

  return 'balanced';
};

export const uploadReferenceAsync = async (
  reportId: string,
  file: File,
): Promise<{ referenceId: string; name: string; size: number }> => {
  const response = await uploadFileAsync(
    {
      path: '/api/report/upload-file',
      file,
      responseSchema: uploadSchema,
      formFields: {
        report_id: reportId,
      },
    },
  );

  return {
    referenceId: response.referenceId,
    name: response.fileName,
    size: response.fileSize ?? file.size,
  };
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

export const generateOutlineAsync = async (args: GenerateOutlineArgs) => {
  const response = await requestJsonAsync(
    {
      path: '/api/ai/generate-outline',
      method: 'POST',
      body: {
        overview: args.overview,
        wordCount: {
          minWordCount: Number(args.wordCount),
          maxWordCount: Number(args.wordCount),
        },
        aiMode: args.aiMode,
        reference: args.reference,
        overviewReferenceId: args.overviewReferenceId,
      },
    },
    outlineResponseSchema,
  );

  return response;
};

export const generateReportAsync = async (args: GenerateReportArgs) => {
  const response = await requestJsonAsync(
    {
      path: '/api/ai/generate-report',
      method: 'POST',
      body: {
        tone: toGenerateReportTone(args.tone),
      },
    },
    reportResponseSchema,
  );

  return response;
};

export const runHumanizeAsync = async (reportId: string, checkerKey: string) => {
  await requestJsonAsync(
    {
      path: '/api/report/humanize',
      method: 'POST',
      body: {
        reportId,
        checker: checkerKey,
      },
    },
    emptySchema,
  );
};
