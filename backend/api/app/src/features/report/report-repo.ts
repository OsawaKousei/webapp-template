import type { Result } from 'neverthrow';
import type { AppError } from '../../../shared/errors/app-error';
import type { Outline, ReportDetail } from './report-schema';

export type FindOutlineByUserIdInput = {
  readonly userId: string;
};

export type SaveOutlineByUserIdInput = {
  readonly userId: string;
  readonly outline: Outline;
};

export type DeleteOutlineByUserIdInput = {
  readonly userId: string;
};

export type FindReportByIdInput = {
  readonly userId: string;
  readonly reportId: string;
};

export type SaveReportByIdInput = {
  readonly report: ReportDetail;
};

export type ReportRepository = {
  readonly findOutlineByUserId: (
    input: FindOutlineByUserIdInput,
  ) => Promise<Result<Outline | null, AppError>>;
  readonly saveOutlineByUserId: (
    input: SaveOutlineByUserIdInput,
  ) => Promise<Result<Outline, AppError>>;
  readonly deleteOutlineByUserId: (
    input: DeleteOutlineByUserIdInput,
  ) => Promise<Result<true, AppError>>;
  readonly findReportById: (
    input: FindReportByIdInput,
  ) => Promise<Result<ReportDetail | null, AppError>>;
  readonly saveReportById: (
    input: SaveReportByIdInput,
  ) => Promise<Result<ReportDetail, AppError>>;
};
