import { err, ok, type Result } from 'neverthrow';
import { createNotFoundError, type AppError } from '@/shared/errors/app-error';
import { CURRENT_USER_ID } from '../auth/current-user';
import type { ReferenceRepository } from './reference-repo';
import type { ReportRepository } from './report-repo';
import type {
  Report,
  ReportRecord,
  SaveReference,
  SaveReportCommand,
} from './report-domain';

type GetMyReportByIdInput = {
  readonly reportRepository: ReportRepository;
  readonly referenceRepository: ReferenceRepository;
  readonly reportId: string;
};

type SaveMyReportByIdInput = {
  readonly reportRepository: ReportRepository;
  readonly referenceRepository: ReferenceRepository;
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

const composeReport = ({
  reportRecord,
  references,
}: {
  readonly reportRecord: ReportRecord;
  readonly references: readonly Report['references'][number][];
}): Report => {
  return {
    ...reportRecord,
    references: references.map((reference) => {
      return {
        ...reference,
        quote: {
          ...reference.quote,
        },
      };
    }),
  };
};

export const getMyReportById = async ({
  reportRepository,
  referenceRepository,
  reportId,
}: GetMyReportByIdInput): Promise<Result<Report, AppError>> => {
  const findResult = await reportRepository.findReportById({
    userId: CURRENT_USER_ID,
    reportId,
  });

  if (findResult.isErr()) {
    return err(findResult.error);
  }

  const reportRecord = findResult.value;

  if (reportRecord === null) {
    return err(createNotFoundError('Report not found'));
  }

  const referenceResult = await referenceRepository.findReferencesByReportId({
    reportId,
  });

  if (referenceResult.isErr()) {
    return err(referenceResult.error);
  }

  const report = composeReport({
    reportRecord,
    references: referenceResult.value,
  });

  return ok(normalizeReportReferenceReportId(report));
};

export const saveMyReportById = async ({
  reportRepository,
  referenceRepository,
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

  const nextReportRecord: ReportRecord = {
    reportId,
    userId: CURRENT_USER_ID,
    title: request.title,
    content: request.content,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const saveResult = await reportRepository.saveReportById({
    report: nextReportRecord,
  });

  if (saveResult.isErr()) {
    return err(saveResult.error);
  }

  const nextReferences = request.references.map((reference) => {
    return attachReportIdToReference({ reportId, reference });
  });
  const referenceSaveResult = await referenceRepository.replaceReferencesByReportId({
    reportId,
    references: nextReferences,
  });

  if (referenceSaveResult.isErr()) {
    return err(referenceSaveResult.error);
  }

  const report = composeReport({
    reportRecord: saveResult.value,
    references: referenceSaveResult.value,
  });

  return ok(normalizeReportReferenceReportId(report));
};
