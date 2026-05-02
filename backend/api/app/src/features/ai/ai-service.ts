import { err, ok, type Result } from 'neverthrow';
import {
  type AppError,
} from '@/shared/errors/app-error';
import { CURRENT_USER_ID } from '../auth/current-user';
import type { ReportRepository } from '../report/report-repo';
import type {
  GenerateReportRequest,
  GenerateReportResponse,
  GenerateOutlineRequest,
  GenerateOutlineResponse,
} from './ai-schema';

type GenerateOutlineInput = {
  readonly request: GenerateOutlineRequest;
};

type GenerateReportInput = {
  readonly reportRepository: ReportRepository;
  readonly request: GenerateReportRequest;
};

const nowIso = (): string => {
  return new Date().toISOString();
};

const normalizeOverview = (overview: string): string => {
  return overview.trim();
};

type GeneratedOutlineItem = GenerateOutlineResponse['outline']['items'][number];

const createOutlineItems = (overview: string): readonly GeneratedOutlineItem[] => {
  const firstLine = overview.split(/\n+/u)[0]?.trim() ?? '';
  const fallback = '概要の要点';
  const source = firstLine.length > 0 ? firstLine : fallback;

  return [
    {
      title: '導入',
      summary: source,
      order: 1,
    },
    {
      title: '本論',
      summary: '論点を整理して説明する',
      order: 2,
    },
    {
      title: '結論',
      summary: '要点をまとめる',
      order: 3,
    },
  ] as const;
};

const createGeneratedOutline = (overview: string): GenerateOutlineResponse => {
  const normalized = normalizeOverview(overview);
  const items = createOutlineItems(normalized);

  return {
    title: normalized,
    outline: {
      items: [...items],
    },
  };
};

const toToneHeader = (tone: GenerateReportRequest['tone']): string => {
  if (tone === 'formal') {
    return '本稿では、以下の構成に沿って要点を整理して述べます。';
  }

  if (tone === 'casual') {
    return 'まずは全体像をつかみやすい形で、順番に見ていきます。';
  }

  return '以下、重要な論点を順に説明します。';
};

const createReportContent = ({
  tone,
  generatedOutline,
}: {
  readonly tone: GenerateReportRequest['tone'];
  readonly generatedOutline: GenerateOutlineResponse;
}): string => {
  const sections = generatedOutline.outline.items
    .map((item) => {
      return `## ${item.order}. ${item.title}\n${item.summary}`;
    })
    .join('\n\n');

  return [
    `# ${generatedOutline.title}`,
    '',
    toToneHeader(tone),
    '',
    sections,
    '',
    '以上です。',
  ].join('\n');
};

const createGeneratedReport = ({
  overview,
  tone,
}: {
  readonly overview: string;
  readonly tone: GenerateReportRequest['tone'];
}): GenerateReportResponse => {
  const generatedOutline = createGeneratedOutline(overview);

  return {
    reportId: crypto.randomUUID(),
    title: generatedOutline.title,
    content: createReportContent({ tone, generatedOutline }),
  };
};

export const generateOutline = async ({
  request,
}: GenerateOutlineInput): Promise<
  Result<GenerateOutlineResponse, AppError>
> => {
  const normalizedOverview = normalizeOverview(request.overview);
  const generated = createGeneratedOutline(normalizedOverview);

  return ok(generated);
};

export const generateReport = async ({
  reportRepository,
  request,
}: GenerateReportInput): Promise<Result<GenerateReportResponse, AppError>> => {
  const generated = createGeneratedReport({
    overview: request.overview,
    tone: request.tone,
  });
  const now = nowIso();
  const saveResult = await reportRepository.saveReportById({
    report: {
      reportId: generated.reportId,
      userId: CURRENT_USER_ID,
      title: generated.title,
      content: generated.content,
      references: [],
      createdAt: now,
      updatedAt: now,
    },
  });

  if (saveResult.isErr()) {
    return err(saveResult.error);
  }

  return ok(generated);
};
