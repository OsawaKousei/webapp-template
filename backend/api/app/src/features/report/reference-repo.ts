import type { Result } from 'neverthrow';
import type { AppError } from '@/shared/errors/app-error';
import type { Reference } from './report-domain';

export type FindReferencesByReportIdInput = {
  readonly reportId: string;
};

export type ReplaceReferencesByReportIdInput = {
  readonly reportId: string;
  readonly references: readonly Reference[];
};

export type ReferenceRepository = {
  readonly findReferencesByReportId: (
    input: FindReferencesByReportIdInput,
  ) => Promise<Result<Reference[], AppError>>;
  readonly replaceReferencesByReportId: (
    input: ReplaceReferencesByReportIdInput,
  ) => Promise<Result<Reference[], AppError>>;
};
