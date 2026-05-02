import { ok, type Result } from 'neverthrow';
import type { AppError } from '../../../shared/errors/app-error';
import { CURRENT_USER_ID } from '../auth/current-user';
import type { ReportRepository } from './report-repo';
import type { Outline } from './report-schema';

type GetMyOutlineInput = {
  readonly reportRepository: ReportRepository;
};

type DeleteMyOutlineInput = {
  readonly reportRepository: ReportRepository;
};

type SaveMyOutlineInput = {
  readonly reportRepository: ReportRepository;
  readonly outline: Outline;
};

export const getMyOutline = async ({
  reportRepository,
}: GetMyOutlineInput): Promise<Result<Outline | null, AppError>> => {
  return reportRepository.findOutlineByUserId({ userId: CURRENT_USER_ID });
};

export const deleteMyOutline = async ({
  reportRepository,
}: DeleteMyOutlineInput): Promise<Result<true, AppError>> => {
  return reportRepository.deleteOutlineByUserId({ userId: CURRENT_USER_ID });
};

export const saveMyOutline = async ({
  reportRepository,
  outline,
}: SaveMyOutlineInput): Promise<Result<Outline, AppError>> => {
  return reportRepository.saveOutlineByUserId({
    userId: CURRENT_USER_ID,
    outline,
  });
};

export const createDeleteOutlineResult = (): Result<true, AppError> => {
  return ok(true);
};
