import type { Result } from 'neverthrow';
import type { AppError } from '@/shared/errors/app-error';
import type { Report } from './report-domain';

export type FindReportByIdInput = {
  readonly userId: string;
  readonly reportId: string;
};

export type SaveReportByIdInput = {
  readonly report: Report;
};

export type ReportRepository = {
  readonly findReportById: (
    input: FindReportByIdInput,
  ) => Promise<Result<Report | null, AppError>>;
  readonly saveReportById: (
    input: SaveReportByIdInput,
  ) => Promise<Result<Report, AppError>>;
};
