import type { Result } from 'neverthrow';
import type { AppError } from '../../../shared/errors/app-error';
import type { ReportSummary, UserProfile } from './user-schema';

export type FindUserByIdInput = {
  readonly userId: string;
};

export type FindReportsByUserIdInput = {
  readonly userId: string;
};

export type UserRepository = {
  readonly findUserById: (
    input: FindUserByIdInput,
  ) => Promise<Result<UserProfile, AppError>>;
  readonly findReportsByUserId: (
    input: FindReportsByUserIdInput,
  ) => Promise<Result<ReportSummary[], AppError>>;
};