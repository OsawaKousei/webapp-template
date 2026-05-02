import { ok, type Result } from 'neverthrow';
import type { AppError } from '../../../shared/errors/app-error';
import type {
  DeleteOutlineByUserIdInput,
  FindOutlineByUserIdInput,
  ReportRepository,
  SaveOutlineByUserIdInput,
} from '../../features/report/report-repo';
import type { Outline } from '../../features/report/report-schema';

const outlineStore = new Map<string, Outline>();

const cloneOutline = (outline: Outline): Outline => {
  return {
    ...outline,
    items: [...outline.items],
  };
};

export const createInMemoryReportRepository = (): ReportRepository => {
  const findOutlineByUserId = async ({
    userId,
  }: FindOutlineByUserIdInput): Promise<Result<Outline | null, AppError>> => {
    const outline = outlineStore.get(userId);

    if (outline === undefined) {
      return ok(null);
    }

    return ok(cloneOutline(outline));
  };

  const saveOutlineByUserId = async ({
    userId,
    outline,
  }: SaveOutlineByUserIdInput): Promise<Result<Outline, AppError>> => {
    const nextOutline = cloneOutline(outline);
    outlineStore.set(userId, nextOutline);

    return ok(cloneOutline(nextOutline));
  };

  const deleteOutlineByUserId = async ({
    userId,
  }: DeleteOutlineByUserIdInput): Promise<Result<true, AppError>> => {
    outlineStore.delete(userId);
    return ok(true);
  };

  return {
    findOutlineByUserId,
    saveOutlineByUserId,
    deleteOutlineByUserId,
  };
};
