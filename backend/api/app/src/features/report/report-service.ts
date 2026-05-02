import { err, ok, type Result } from 'neverthrow';
import { createNotFoundError, type AppError } from '@/shared/errors/app-error';
import { CURRENT_USER_ID } from '../auth/current-user';
import type { ReportRepository } from './report-repo';
import type { Outline, Report, SaveReportCommand } from './report-domain';

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

type GetMyReportByIdInput = {
  readonly reportRepository: ReportRepository;
  readonly reportId: string;
};

type SaveMyReportByIdInput = {
  readonly reportRepository: ReportRepository;
  readonly reportId: string;
  readonly request: SaveReportCommand;
};

const nowIso = (): string => {
  return new Date().toISOString();
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

export const getMyReportById = async ({
  reportRepository,
  reportId,
}: GetMyReportByIdInput): Promise<Result<Report, AppError>> => {
  const findResult = await reportRepository.findReportById({
    userId: CURRENT_USER_ID,
    reportId,
  });

  if (findResult.isErr()) {
    return err(findResult.error);
  }

  const report = findResult.value;

  if (report === null) {
    return err(createNotFoundError('Report not found'));
  }

  return ok(report);
};

export const saveMyReportById = async ({
  reportRepository,
  reportId,
  request,
}: SaveMyReportByIdInput): Promise<Result<Report, AppError>> => {
  const existingResult = await reportRepository.findReportById({
    userId: CURRENT_USER_ID,
    reportId,
  });

  if (existingResult.isErr()) {
    return err(existingResult.error);
  }

  const now = nowIso();
  const existing = existingResult.value;

  const nextReport: Report = {
    reportId,
    userId: CURRENT_USER_ID,
    title: request.title,
    content: request.content,
    references: request.references,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  return reportRepository.saveReportById({ report: nextReport });
};
