import { err, ok, type Result } from 'neverthrow';
import {
  createInternalServerError,
  type AppError,
} from '@/shared/errors/app-error';
import type {
  FindReportByIdInput,
  ReportRepository,
  SaveReportByIdInput,
} from '../../src/features/report/report-repo';
import type { ReportRecord } from '../../src/features/report/report-domain';

type FakeReportRepoConfig = {
  readonly initialReportByReportId?: Readonly<Record<string, ReportRecord>>;
  readonly forceInternalError?: boolean;
};

const cloneReport = (report: ReportRecord): ReportRecord => {
  return {
    ...report,
  };
};

export const createFakeReportRepository = (
  config: FakeReportRepoConfig = {},
): ReportRepository => {
  const reportEntries = Object.entries(config.initialReportByReportId ?? {});
  const reportStore = reportEntries.reduce<Map<string, ReportRecord>>(
    (accumulator, [reportId, report]) => {
      accumulator.set(reportId, cloneReport(report));
      return accumulator;
    },
    new Map<string, Report>(),
  );

  const findReportById = async ({
    userId,
    reportId,
  }: FindReportByIdInput): Promise<Result<ReportRecord | null, AppError>> => {
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
  }: SaveReportByIdInput): Promise<Result<ReportRecord, AppError>> => {
    if (config.forceInternalError === true) {
      return err(createInternalServerError('forced internal error'));
    }

    const next = cloneReport(report);
    reportStore.set(next.reportId, next);

    return ok(cloneReport(next));
  };

  return {
    findReportById,
    saveReportById,
  };
};
