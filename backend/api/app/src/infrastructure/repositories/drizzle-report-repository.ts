import { and, eq } from 'drizzle-orm';
import { err, ok, type Result } from 'neverthrow';
import type { DatabaseClient } from '../db/client';
import { reports } from '../db/schema';
import type {
  FindReportByIdInput,
  ReportRepository,
  SaveReportByIdInput,
} from '@/src/features/report/report-repo';
import type { ReportRecord } from '@/src/features/report/report-domain';
import {
  createInternalServerError,
  type AppError,
} from '@/shared/errors/app-error';

type CreateDrizzleReportRepositoryInput = {
  readonly db: DatabaseClient;
};

const cloneReportRecord = (report: ReportRecord): ReportRecord => {
  return {
    ...report,
  };
};

const parseJsonContent = (content: unknown): string => {
  if (typeof content === 'string') {
    return content;
  }

  return JSON.stringify(content);
};

const toIsoString = (value: Date): string => {
  return value.toISOString();
};

const withInternalServerError = (message: string): Result<never, AppError> => {
  return err(createInternalServerError(message));
};

export const createDrizzleReportRepository = ({
  db,
}: CreateDrizzleReportRepositoryInput): ReportRepository => {
  const findReportById = async ({
    userId,
    reportId,
  }: FindReportByIdInput): Promise<Result<ReportRecord | null, AppError>> => {
    try {
      const reportRows = await db
        .select()
        .from(reports)
        .where(and(eq(reports.userId, userId), eq(reports.reportId, reportId)))
        .limit(1);
      const reportRow = reportRows[0];

      if (reportRow === undefined) {
        return ok(null);
      }

      const reportRecord: ReportRecord = {
        reportId: reportRow.reportId,
        userId: reportRow.userId,
        title: reportRow.title,
        content: parseJsonContent(reportRow.content),
        createdAt: toIsoString(reportRow.createdAt),
        updatedAt: toIsoString(reportRow.updatedAt),
      };

      return ok(cloneReportRecord(reportRecord));
    } catch {
      return withInternalServerError('Failed to find report');
    }
  };

  const saveReportById = async ({
    report,
  }: SaveReportByIdInput): Promise<Result<ReportRecord, AppError>> => {
    try {
      await db
        .insert(reports)
        .values({
          reportId: report.reportId,
          userId: report.userId,
          title: report.title,
          content: report.content,
          createdAt: new Date(report.createdAt),
          updatedAt: new Date(report.updatedAt),
        })
        .onConflictDoUpdate({
          target: reports.reportId,
          set: {
            userId: report.userId,
            title: report.title,
            content: report.content,
            updatedAt: new Date(report.updatedAt),
          },
        });

      return ok(cloneReportRecord(report));
    } catch {
      return withInternalServerError('Failed to save report');
    }
  };

  return {
    findReportById,
    saveReportById,
  };
};
