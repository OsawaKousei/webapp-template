import { err, ok, type Result } from 'neverthrow';
import type { UserRepository } from '../../features/user/user-repo';
import type { ReportSummary, UserProfile } from '../../features/user/user-schema';
import {
  createInternalServerError,
  createNotFoundError,
  type AppError,
} from '../../../shared/errors/app-error';

const userRecordById: Readonly<Record<string, UserProfile>> = {
  u123: {
    id: 'u123',
    displayName: 'Gemini Node',
    email: 'gemini@example.com',
    subscriptionPlan: 'standard',
    credits: 120,
  },
};

const reportRecordByUserId: Readonly<Record<string, readonly ReportSummary[]>> = {
  u123: [
    {
      reportId: 'r-001',
      title: 'AI Report Draft',
      lastModifiedAt: '2026-05-01T10:00:00.000Z',
    },
  ],
};

const findUserFromRecord = (userId: string): Result<UserProfile, AppError> => {
  const user = userRecordById[userId];

  if (user === undefined) {
    return err(createNotFoundError('User not found'));
  }

  return ok(user);
};

export const createInMemoryUserRepository = (): UserRepository => {
  return {
    findUserById: async ({ userId }) => {
      const parseResult = findUserFromRecord(userId);

      if (parseResult.isErr()) {
        return parseResult;
      }

      const user = parseResult.value;

      if (user.id.length < 1) {
        return err(createInternalServerError('Invalid user data'));
      }

      return ok(user);
    },
    findReportsByUserId: async ({ userId }) => {
      const reports = reportRecordByUserId[userId] ?? [];
      return ok([...reports]);
    },
  };
};