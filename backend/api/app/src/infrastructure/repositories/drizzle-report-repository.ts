import { and, asc, eq } from 'drizzle-orm';
import { err, ok, type Result } from 'neverthrow';
import type { DatabaseClient } from '../db/client';
import {
  quotes,
  reportReferences,
  reports,
} from '../db/schema';
import type {
  FindReportByIdInput,
  ReportRepository,
  SaveReportByIdInput,
} from '@/src/features/report/report-repo';
import type {
  Reference,
  Report,
} from '@/src/features/report/report-domain';
import {
  createInternalServerError,
  type AppError,
} from '@/shared/errors/app-error';

const toQuoteReferenceType = (
  value: string | null,
): 'book' | 'article' | 'website' | undefined => {
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

type CreateDrizzleReportRepositoryInput = {
  readonly db: DatabaseClient;
};

const cloneReferences = (references: readonly Reference[]): Reference[] => {
  return references.map((reference) => {
    return {
      ...reference,
      quote: {
        ...reference.quote,
      },
    };
  });
};

const cloneReport = (report: Report): Report => {
  return {
    ...report,
    references: cloneReferences(report.references),
  };
};

const parseJsonContent = (content: unknown): string => {
  if (typeof content === 'string') {
    return content;
  }

  return JSON.stringify(content);
};

const toIsoString = (value: Date): string => {
  return value.toISOString();
};

const withInternalServerError = (message: string): Result<never, AppError> => {
  return err(createInternalServerError(message));
};

export const createDrizzleReportRepository = ({
  db,
}: CreateDrizzleReportRepositoryInput): ReportRepository => {
  const findReportReferences = async ({
    reportId,
  }: {
    readonly reportId: string;
  }): Promise<Reference[]> => {
    const rows = await db
      .select({
        referenceId: reportReferences.id,
        referenceContent: reportReferences.content,
        referenceObjectUrl: reportReferences.objectUrl,
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
      .from(reportReferences)
      .innerJoin(quotes, eq(reportReferences.quoteId, quotes.id))
      .where(eq(reportReferences.reportId, reportId))
      .orderBy(asc(reportReferences.id));

    return rows.map((row) => {
      return {
        id: row.referenceId,
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
      };
    });
  };

  const findReportById = async ({
    userId,
    reportId,
  }: FindReportByIdInput): Promise<Result<Report | null, AppError>> => {
    try {
      const reportRows = await db
        .select()
        .from(reports)
        .where(and(eq(reports.userId, userId), eq(reports.reportId, reportId)))
        .limit(1);
      const reportRow = reportRows[0];

      if (reportRow === undefined) {
        return ok(null);
      }

      const references = await findReportReferences({ reportId });
      const report: Report = {
        reportId: reportRow.reportId,
        userId: reportRow.userId,
        title: reportRow.title,
        content: parseJsonContent(reportRow.content),
        references,
        createdAt: toIsoString(reportRow.createdAt),
        updatedAt: toIsoString(reportRow.updatedAt),
      };

      return ok(cloneReport(report));
    } catch {
      return withInternalServerError('Failed to find report');
    }
  };

  const saveReferences = async ({
    reportId,
    references,
  }: {
    readonly reportId: string;
    readonly references: readonly Reference[];
  }): Promise<void> => {
    await db.delete(reportReferences).where(eq(reportReferences.reportId, reportId));

    await references.reduce<Promise<void>>((previous, reference) => {
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
          .insert(reportReferences)
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
            target: reportReferences.id,
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
  };

  const saveReportById = async ({
    report,
  }: SaveReportByIdInput): Promise<Result<Report, AppError>> => {
    try {
      await db
        .insert(reports)
        .values({
          reportId: report.reportId,
          userId: report.userId,
          title: report.title,
          content: report.content,
          createdAt: new Date(report.createdAt),
          updatedAt: new Date(report.updatedAt),
        })
        .onConflictDoUpdate({
          target: reports.reportId,
          set: {
            userId: report.userId,
            title: report.title,
            content: report.content,
            updatedAt: new Date(report.updatedAt),
          },
        });

      await saveReferences({
        reportId: report.reportId,
        references: report.references,
      });

      return ok(cloneReport(report));
    } catch {
      return withInternalServerError('Failed to save report');
    }
  };

  return {
    findReportById,
    saveReportById,
  };
};
