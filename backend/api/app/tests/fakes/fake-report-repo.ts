import { err, ok, type Result } from 'neverthrow';
import {
  createInternalServerError,
  type AppError,
} from '@/shared/errors/app-error';
import type {
  DeleteOutlineByUserIdInput,
  FindReportByIdInput,
  FindOutlineByUserIdInput,
  ReportRepository,
  SaveReportByIdInput,
  SaveOutlineByUserIdInput,
} from '../../src/features/report/report-repo';
import type {
  Outline,
  ReportDetail,
} from '../../src/features/report/report-schema';

type FakeReportRepoConfig = {
  readonly initialOutlineByUserId?: Readonly<Record<string, Outline>>;
  readonly initialReportByReportId?: Readonly<Record<string, ReportDetail>>;
  readonly forceInternalError?: boolean;
};

const cloneOutline = (outline: Outline): Outline => {
  return {
    ...outline,
    items: [...outline.items],
  };
};

const cloneReport = (report: ReportDetail): ReportDetail => {
  return {
    ...report,
  };
};

export const createFakeReportRepository = (
  config: FakeReportRepoConfig = {},
): ReportRepository => {
  const entries = Object.entries(config.initialOutlineByUserId ?? {});
  const store = entries.reduce<Map<string, Outline>>(
    (accumulator, [userId, outline]) => {
      accumulator.set(userId, cloneOutline(outline));
      return accumulator;
    },
    new Map<string, Outline>(),
  );
  const reportEntries = Object.entries(config.initialReportByReportId ?? {});
  const reportStore = reportEntries.reduce<Map<string, ReportDetail>>(
    (accumulator, [reportId, report]) => {
      accumulator.set(reportId, cloneReport(report));
      return accumulator;
    },
    new Map<string, ReportDetail>(),
  );

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

  const findReportById = async ({
    userId,
    reportId,
  }: FindReportByIdInput): Promise<Result<ReportDetail | null, AppError>> => {
    if (config.forceInternalError === true) {
      return err(createInternalServerError('forced internal error'));
    }

    const report = reportStore.get(reportId);

    if (report === undefined) {
      return ok(null);
    }

    if (report.userId !== userId) {
      return ok(null);
    }

    return ok(cloneReport(report));
  };

  const saveReportById = async ({
    report,
  }: SaveReportByIdInput): Promise<Result<ReportDetail, AppError>> => {
    if (config.forceInternalError === true) {
      return err(createInternalServerError('forced internal error'));
    }

    const next = cloneReport(report);
    reportStore.set(next.reportId, next);

    return ok(cloneReport(next));
  };

  return {
    findOutlineByUserId,
    saveOutlineByUserId,
    deleteOutlineByUserId,
    findReportById,
    saveReportById,
  };
};
