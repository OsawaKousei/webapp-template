import { err, ok, type Result } from 'neverthrow';
import { createNotFoundError, type AppError } from '@/shared/errors/app-error';
import { CURRENT_USER_ID } from '../auth/current-user';
import type { ReportRepository } from './report-repo';
import type { Report, SaveReference, SaveReportCommand } from './report-domain';

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

const attachReportIdToReference = ({
  reportId,
  reference,
}: {
  readonly reportId: string;
  readonly reference: SaveReference;
}): Report['references'][number] => {
  return {
    ...reference,
    reportId,
  };
};

const normalizeReportReferenceReportId = (report: Report): Report => {
  return {
    ...report,
    references: report.references.map((reference) => {
      return {
        ...reference,
        reportId: report.reportId,
      };
    }),
  };
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

  return ok(normalizeReportReferenceReportId(report));
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
    references: request.references.map((reference) => {
      return attachReportIdToReference({ reportId, reference });
    }),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const saveResult = await reportRepository.saveReportById({ report: nextReport });

  if (saveResult.isErr()) {
    return err(saveResult.error);
  }

  return ok(normalizeReportReferenceReportId(saveResult.value));
};
