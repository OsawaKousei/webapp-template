import type { Result } from 'neverthrow';
import type { AppError } from '@/shared/errors/app-error';
import type { ReportRecord } from './report-domain';

export type FindReportByIdInput = {
  readonly userId: string;
  readonly reportId: string;
};

export type SaveReportByIdInput = {
  readonly report: ReportRecord;
};

export type ReportRepository = {
  readonly findReportById: (
    input: FindReportByIdInput,
  ) => Promise<Result<ReportRecord | null, AppError>>;
  readonly saveReportById: (
    input: SaveReportByIdInput,
  ) => Promise<Result<ReportRecord, AppError>>;
};
