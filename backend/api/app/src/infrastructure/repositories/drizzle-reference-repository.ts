import { asc, eq } from 'drizzle-orm';
import { err, ok, type Result } from 'neverthrow';
import type { DatabaseClient } from '../db/client';
import { quotes, references } from '../db/schema';
import type {
  Reference,
  QuoteReferenceType,
} from '@/src/features/report/report-domain';
import type {
  FindReferencesByReportIdInput,
  ReferenceRepository,
  ReplaceReferencesByReportIdInput,
} from '@/src/features/report/reference-repo';
import {
  createInternalServerError,
  type AppError,
} from '@/shared/errors/app-error';

const toQuoteReferenceType = (
  value: string | null,
): QuoteReferenceType | undefined => {
  if (value === 'book') {
    return value;
  }

  if (value === 'article') {
    return value;
  }

  if (value === 'website') {
    return value;
  }

  return undefined;
};

type CreateDrizzleReferenceRepositoryInput = {
  readonly db: DatabaseClient;
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

const withInternalServerError = (message: string): Result<never, AppError> => {
  return err(createInternalServerError(message));
};

export const createDrizzleReferenceRepository = ({
  db,
}: CreateDrizzleReferenceRepositoryInput): ReferenceRepository => {
  const findReferencesByReportId = async ({
    reportId,
  }: FindReferencesByReportIdInput): Promise<Result<Reference[], AppError>> => {
    try {
      const rows = await db
        .select({
          referenceId: references.id,
          referenceContent: references.content,
          referenceObjectUrl: references.objectUrl,
          quoteId: quotes.id,
          quoteText: quotes.text,
          quoteSource: quotes.source,
          quotePage: quotes.page,
          quoteReferenceType: quotes.referenceType,
          quoteAuthors: quotes.authors,
          quoteTitle: quotes.title,
          quoteYear: quotes.year,
          quotePublisher: quotes.publisher,
          quoteJournal: quotes.journal,
          quoteVolume: quotes.volume,
          quoteIssue: quotes.issue,
          quotePages: quotes.pages,
          quoteUrl: quotes.url,
          quoteAccessDate: quotes.accessDate,
        })
        .from(references)
        .innerJoin(quotes, eq(references.quoteId, quotes.id))
        .where(eq(references.reportId, reportId))
        .orderBy(asc(references.id));

      const values = rows.map((row) => {
        return {
          id: row.referenceId,
          reportId,
          quote: {
            id: row.quoteId,
            text: row.quoteText,
            source: row.quoteSource,
            page: row.quotePage ?? undefined,
            referenceType: toQuoteReferenceType(row.quoteReferenceType),
            authors: row.quoteAuthors ?? undefined,
            title: row.quoteTitle ?? undefined,
            year: row.quoteYear ?? undefined,
            publisher: row.quotePublisher ?? undefined,
            journal: row.quoteJournal ?? undefined,
            volume: row.quoteVolume ?? undefined,
            issue: row.quoteIssue ?? undefined,
            pages: row.quotePages ?? undefined,
            url: row.quoteUrl ?? undefined,
            accessDate: row.quoteAccessDate ?? undefined,
          },
          content: row.referenceContent,
          object_url: row.referenceObjectUrl ?? undefined,
        } as const;
      });

      return ok(cloneReferences(values));
    } catch {
      return withInternalServerError('Failed to find references by report');
    }
  };

  const replaceReferencesByReportId = async ({
    reportId,
    references: nextReferences,
  }: ReplaceReferencesByReportIdInput): Promise<Result<Reference[], AppError>> => {
    try {
      await db.delete(references).where(eq(references.reportId, reportId));

      await nextReferences.reduce<Promise<void>>((previous, reference) => {
        return previous.then(async () => {
          const now = new Date();

          await db
            .insert(quotes)
            .values({
              id: reference.quote.id,
              text: reference.quote.text,
              source: reference.quote.source,
              page: reference.quote.page ?? null,
              referenceType: reference.quote.referenceType ?? null,
              authors: reference.quote.authors ?? null,
              title: reference.quote.title ?? null,
              year: reference.quote.year ?? null,
              publisher: reference.quote.publisher ?? null,
              journal: reference.quote.journal ?? null,
              volume: reference.quote.volume ?? null,
              issue: reference.quote.issue ?? null,
              pages: reference.quote.pages ?? null,
              url: reference.quote.url ?? null,
              accessDate: reference.quote.accessDate ?? null,
              createdAt: now,
              updatedAt: now,
            })
            .onConflictDoUpdate({
              target: quotes.id,
              set: {
                text: reference.quote.text,
                source: reference.quote.source,
                page: reference.quote.page ?? null,
                referenceType: reference.quote.referenceType ?? null,
                authors: reference.quote.authors ?? null,
                title: reference.quote.title ?? null,
                year: reference.quote.year ?? null,
                publisher: reference.quote.publisher ?? null,
                journal: reference.quote.journal ?? null,
                volume: reference.quote.volume ?? null,
                issue: reference.quote.issue ?? null,
                pages: reference.quote.pages ?? null,
                url: reference.quote.url ?? null,
                accessDate: reference.quote.accessDate ?? null,
                updatedAt: now,
              },
            });

          await db
            .insert(references)
            .values({
              id: reference.id,
              reportId,
              quoteId: reference.quote.id,
              content: reference.content,
              objectUrl: reference.object_url ?? null,
              createdAt: now,
              updatedAt: now,
            })
            .onConflictDoUpdate({
              target: references.id,
              set: {
                reportId,
                quoteId: reference.quote.id,
                content: reference.content,
                objectUrl: reference.object_url ?? null,
                updatedAt: now,
              },
            });
        });
      }, Promise.resolve());

      return ok(cloneReferences(nextReferences));
    } catch {
      return withInternalServerError('Failed to replace references by report');
    }
  };

  return {
    findReferencesByReportId,
    replaceReferencesByReportId,
  };
};
