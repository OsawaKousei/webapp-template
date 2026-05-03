import { ok, type Result } from 'neverthrow';
import type { AppError } from '@/shared/errors/app-error';
import type {
  FindReportByIdInput,
  ReportRepository,
  SaveReportByIdInput,
} from '../../features/report/report-repo';
import type { ReportRecord } from '../../features/report/report-domain';

const reportStore = new Map<string, ReportRecord>();

const cloneReport = (report: ReportRecord): ReportRecord => {
  return {
    ...report,
  };
};

export const createInMemoryReportRepository = (): ReportRepository => {
  const findReportById = async ({
    userId,
    reportId,
  }: FindReportByIdInput): Promise<Result<ReportRecord | null, AppError>> => {
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
    const nextReport = cloneReport(report);
    reportStore.set(nextReport.reportId, nextReport);

    return ok(cloneReport(nextReport));
  };

  return {
    findReportById,
    saveReportById,
  };
};
