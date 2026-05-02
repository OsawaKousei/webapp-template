import { err, ok, type Result } from 'neverthrow';
import {
  createInternalServerError,
  createNotFoundError,
  type AppError,
} from '@/shared/errors/app-error';
import type {
  FindReportsByUserIdInput,
  FindUserByIdInput,
  UserRepository,
} from '../../src/features/user/user-repo';
import type {
  ReportSummary,
  UserProfile,
} from '../../src/features/user/user-schema';

type FakeUserRepoConfig = {
  readonly users?: readonly UserProfile[];
  readonly reportsByUserId?: Readonly<Record<string, readonly ReportSummary[]>>;
  readonly forceInternalError?: boolean;
};

const toUserMap = (
  users: readonly UserProfile[],
): ReadonlyMap<string, UserProfile> => {
  return users.reduce<Map<string, UserProfile>>((accumulator, user) => {
    accumulator.set(user.id, user);
    return accumulator;
  }, new Map<string, UserProfile>());
};

export const createFakeUserRepository = (
  config: FakeUserRepoConfig = {},
): UserRepository => {
  const userMap = toUserMap(config.users ?? []);
  const reportsByUserId = config.reportsByUserId ?? {};

  const findUserById = async ({
    userId,
  }: FindUserByIdInput): Promise<Result<UserProfile, AppError>> => {
    if (config.forceInternalError === true) {
      return err(createInternalServerError('forced internal error'));
    }

    const user = userMap.get(userId);

    if (user === undefined) {
      return err(createNotFoundError('User not found'));
    }

    return ok(user);
  };

  const findReportsByUserId = async ({
    userId,
  }: FindReportsByUserIdInput): Promise<Result<ReportSummary[], AppError>> => {
    if (config.forceInternalError === true) {
      return err(createInternalServerError('forced internal error'));
    }

    return ok([...(reportsByUserId[userId] ?? [])]);
  };

  return {
    findUserById,
    findReportsByUserId,
  };
};
