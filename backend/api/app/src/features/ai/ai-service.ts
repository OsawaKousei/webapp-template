import { err, ok, type Result } from 'neverthrow';
import {
  createConflictError,
  type AppError,
} from '../../../shared/errors/app-error';
import { CURRENT_USER_ID } from '../auth/current-user';
import type { ReportRepository } from '../report/report-repo';
import type {
  GenerateOutlineRequest,
  GenerateOutlineResponse,
  Outline,
  OutlineItem,
} from './ai-schema';

type GenerateOutlineInput = {
  readonly reportRepository: ReportRepository;
  readonly request: GenerateOutlineRequest;
};

const nowIso = (): string => {
  return new Date().toISOString();
};

const normalizeOverview = (overview: string): string => {
  return overview.trim();
};

const createOutlineItems = (overview: string): readonly OutlineItem[] => {
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

const toOutlineEntity = ({
  generated,
  normalizedOverview,
  existing,
}: {
  readonly generated: GenerateOutlineResponse;
  readonly normalizedOverview: string;
  readonly existing: Outline | null;
}): Outline => {
  const createdAt = existing?.createdAt ?? nowIso();

  return {
    userId: CURRENT_USER_ID,
    overview: normalizedOverview,
    title: generated.title,
    items: generated.outline.items,
    createdAt,
    updatedAt: nowIso(),
  };
};

export const generateOutline = async ({
  reportRepository,
  request,
}: GenerateOutlineInput): Promise<Result<GenerateOutlineResponse, AppError>> => {
  const existingResult = await reportRepository.findOutlineByUserId({
    userId: CURRENT_USER_ID,
  });

  if (existingResult.isErr()) {
    return err(existingResult.error);
  }

  const existing = existingResult.value;

  if (existing !== null && request.overwriteExisting !== true) {
    return err(createConflictError('Outline already exists'));
  }

  const normalizedOverview = normalizeOverview(request.overview);
  const generated = createGeneratedOutline(normalizedOverview);
  const outline = toOutlineEntity({
    generated,
    normalizedOverview,
    existing,
  });

  const saveResult = await reportRepository.saveOutlineByUserId({
    userId: CURRENT_USER_ID,
    outline,
  });

  if (saveResult.isErr()) {
    return err(saveResult.error);
  }

  return ok(generated);
};
