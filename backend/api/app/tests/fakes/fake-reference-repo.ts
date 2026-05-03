import { err, ok, type Result } from 'neverthrow';
import {
  createInternalServerError,
  type AppError,
} from '@/shared/errors/app-error';
import type {
  FindReferencesByReportIdInput,
  ReferenceRepository,
  ReplaceReferencesByReportIdInput,
} from '../../src/features/report/reference-repo';
import type { Reference } from '../../src/features/report/report-domain';

type FakeReferenceRepoConfig = {
  readonly referencesByReportId?: Readonly<Record<string, readonly Reference[]>>;
  readonly forceInternalError?: boolean;
};

const cloneReferences = (values: readonly Reference[]): Reference[] => {
  return values.map((reference) => {
    return {
      ...reference,
      quote: {
        ...reference.quote,
      },
    };
  });
};

export const createFakeReferenceRepository = (
  config: FakeReferenceRepoConfig = {},
): ReferenceRepository => {
  const referenceStore = Object.entries(config.referencesByReportId ?? {}).reduce<
    Map<string, Reference[]>
  >((accumulator, [reportId, references]) => {
    accumulator.set(reportId, cloneReferences(references));
    return accumulator;
  }, new Map<string, Reference[]>());

  const findReferencesByReportId = async ({
    reportId,
  }: FindReferencesByReportIdInput): Promise<Result<Reference[], AppError>> => {
    if (config.forceInternalError === true) {
      return err(createInternalServerError('forced internal error'));
    }

    return ok(cloneReferences(referenceStore.get(reportId) ?? []));
  };

  const replaceReferencesByReportId = async ({
    reportId,
    references,
  }: ReplaceReferencesByReportIdInput): Promise<Result<Reference[], AppError>> => {
    if (config.forceInternalError === true) {
      return err(createInternalServerError('forced internal error'));
    }

    const next = cloneReferences(references);
    referenceStore.set(reportId, next);

    return ok(cloneReferences(next));
  };

  return {
    findReferencesByReportId,
    replaceReferencesByReportId,
  };
};
