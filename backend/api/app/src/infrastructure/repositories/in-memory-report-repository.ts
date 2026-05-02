import { ok, type Result } from 'neverthrow';
import type { AppError } from '@/shared/errors/app-error';
import type {
  DeleteOutlineByUserIdInput,
  FindReportByIdInput,
  FindOutlineByUserIdInput,
  ReportRepository,
  SaveReportByIdInput,
  SaveOutlineByUserIdInput,
} from '../../features/report/report-repo';
import type {
  Outline,
  Report,
} from '../../features/report/report-domain';

const outlineStore = new Map<string, Outline>();
const reportStore = new Map<string, Report>();

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
    findOutlineByUserId,
    saveOutlineByUserId,
    deleteOutlineByUserId,
    findReportById,
    saveReportById,
  };
};
