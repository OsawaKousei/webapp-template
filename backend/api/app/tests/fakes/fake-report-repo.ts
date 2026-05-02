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
import type { Report } from '../../src/features/report/report-domain';

type FakeReportRepoConfig = {
  readonly initialReportByReportId?: Readonly<Record<string, Report>>;
  readonly forceInternalError?: boolean;
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
  const reportEntries = Object.entries(config.initialReportByReportId ?? {});
  const reportStore = reportEntries.reduce<Map<string, Report>>(
    (accumulator, [reportId, report]) => {
      accumulator.set(reportId, cloneReport(report));
      return accumulator;
    },
    new Map<string, Report>(),
  );

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
    findReportById,
    saveReportById,
  };
};
