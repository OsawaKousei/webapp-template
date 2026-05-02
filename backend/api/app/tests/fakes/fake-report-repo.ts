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
  Report,
} from '../../src/features/report/report-domain';

type FakeReportRepoConfig = {
  readonly initialOutlineByUserId?: Readonly<Record<string, Outline>>;
  readonly initialReportByReportId?: Readonly<Record<string, Report>>;
  readonly forceInternalError?: boolean;
};

const cloneOutline = (outline: Outline): Outline => {
  return {
    ...outline,
    items: [...outline.items],
  };
};

const cloneReport = (report: Report): Report => {
  return {
    ...report,
    references: report.references.map((reference) => {
      return {
        ...reference,
        quote: {
          ...reference.quote,
        },
      };
    }),
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
  const reportStore = reportEntries.reduce<Map<string, Report>>(
    (accumulator, [reportId, report]) => {
      accumulator.set(reportId, cloneReport(report));
      return accumulator;
    },
    new Map<string, Report>(),
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
  }: FindReportByIdInput): Promise<Result<Report | null, AppError>> => {
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
  }: SaveReportByIdInput): Promise<Result<Report, AppError>> => {
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
