import { ok, type Result } from 'neverthrow';
import type { AppError } from '@/shared/errors/app-error';
import type {
  FindReportByIdInput,
  ReportRepository,
  SaveReportByIdInput,
} from '../../features/report/report-repo';
import type { Report } from '../../features/report/report-domain';

const reportStore = new Map<string, Report>();

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

export const createInMemoryReportRepository = (): ReportRepository => {
  const findReportById = async ({
    userId,
    reportId,
  }: FindReportByIdInput): Promise<Result<Report | null, AppError>> => {
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
    const nextReport = cloneReport(report);
    reportStore.set(nextReport.reportId, nextReport);

    return ok(cloneReport(nextReport));
  };

  return {
    findReportById,
    saveReportById,
  };
};
