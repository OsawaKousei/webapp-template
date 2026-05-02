import type { Result } from 'neverthrow';
import type { AppError } from '../../../shared/errors/app-error';
import type { Outline } from './report-schema';

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
};
