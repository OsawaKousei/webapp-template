import { err, ok, type Result } from 'neverthrow';
import {
  createInternalServerError,
  type AppError,
} from '../../shared/errors/app-error';
import type {
  DeleteOutlineByUserIdInput,
  FindOutlineByUserIdInput,
  ReportRepository,
  SaveOutlineByUserIdInput,
} from '../../src/features/report/report-repo';
import type { Outline } from '../../src/features/report/report-schema';

type FakeReportRepoConfig = {
  readonly initialOutlineByUserId?: Readonly<Record<string, Outline>>;
  readonly forceInternalError?: boolean;
};

const cloneOutline = (outline: Outline): Outline => {
  return {
    ...outline,
    items: [...outline.items],
  };
};

export const createFakeReportRepository = (
  config: FakeReportRepoConfig = {},
): ReportRepository => {
  const entries = Object.entries(config.initialOutlineByUserId ?? {});
  const store = entries.reduce<Map<string, Outline>>((accumulator, [userId, outline]) => {
    accumulator.set(userId, cloneOutline(outline));
    return accumulator;
  }, new Map<string, Outline>());

  const findOutlineByUserId = async ({
    userId,
  }: FindOutlineByUserIdInput): Promise<Result<Outline | null, AppError>> => {
    if (config.forceInternalError === true) {
      return err(createInternalServerError('forced internal error'));
    }

    const outline = store.get(userId);

    if (outline === undefined) {
      return ok(null);
    }

    return ok(cloneOutline(outline));
  };

  const saveOutlineByUserId = async ({
    userId,
    outline,
  }: SaveOutlineByUserIdInput): Promise<Result<Outline, AppError>> => {
    if (config.forceInternalError === true) {
      return err(createInternalServerError('forced internal error'));
    }

    const next = cloneOutline(outline);
    store.set(userId, next);

    return ok(cloneOutline(next));
  };

  const deleteOutlineByUserId = async ({
    userId,
  }: DeleteOutlineByUserIdInput): Promise<Result<true, AppError>> => {
    if (config.forceInternalError === true) {
      return err(createInternalServerError('forced internal error'));
    }

    store.delete(userId);
    return ok(true);
  };

  return {
    findOutlineByUserId,
    saveOutlineByUserId,
    deleteOutlineByUserId,
  };
};
