import { desc, eq } from 'drizzle-orm';
import { err, ok, type Result } from 'neverthrow';
import type { DatabaseClient } from '../db/client';
import { reports, users } from '../db/schema';
import { SubscriptionPlanSchema } from '@/shared/types/user';
import type { UserRepository } from '@/src/features/user/user-repo';
import type {
  ReportSummary,
  UserProfile,
} from '@/src/features/user/user-schema';
import {
  createInternalServerError,
  createNotFoundError,
  type AppError,
} from '@/shared/errors/app-error';

type CreateDrizzleUserRepositoryInput = {
  readonly db: DatabaseClient;
};

const toIsoString = (value: Date): string => {
  return value.toISOString();
};

export const createDrizzleUserRepository = ({
  db,
}: CreateDrizzleUserRepositoryInput): UserRepository => {
  const findUserById = async ({
    userId,
  }: {
    readonly userId: string;
  }): Promise<Result<UserProfile, AppError>> => {
    try {
      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.userId, userId))
        .limit(1);
      const userRow = userRows[0];

      if (userRow === undefined) {
        return err(createNotFoundError('User not found'));
      }

      const user: UserProfile = {
        id: userRow.userId,
        displayName: userRow.displayName,
        email: userRow.email,
        subscriptionPlan: SubscriptionPlanSchema.parse(
          userRow.subscriptionPlan,
        ),
        credits: userRow.credits,
      };

      return ok(user);
    } catch {
      return err(createInternalServerError('Failed to find user'));
    }
  };

  const findReportsByUserId = async ({
    userId,
  }: {
    readonly userId: string;
  }): Promise<Result<ReportSummary[], AppError>> => {
    try {
      const reportRows = await db
        .select({
          reportId: reports.reportId,
          title: reports.title,
          updatedAt: reports.updatedAt,
        })
        .from(reports)
        .where(eq(reports.userId, userId))
        .orderBy(desc(reports.updatedAt));

      const summaries: ReportSummary[] = reportRows.map((report) => {
        return {
          reportId: report.reportId,
          title: report.title,
          lastModifiedAt: toIsoString(report.updatedAt),
        };
      });

      return ok(summaries);
    } catch {
      return err(createInternalServerError('Failed to find reports by user'));
    }
  };

  return {
    findUserById,
    findReportsByUserId,
  };
};
