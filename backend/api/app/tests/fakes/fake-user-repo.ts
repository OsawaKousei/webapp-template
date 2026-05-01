import { err, ok, type Result } from 'neverthrow';
import {
  createInternalServerError,
  createNotFoundError,
  type AppError,
} from '../../shared/errors/app-error';
import type {
  FindUserByIdInput,
  UserRepository,
} from '../../src/features/user/user-repo';
import type { User } from '../../src/features/user/user-schema';

type FakeUserRepoConfig = {
  readonly users?: readonly User[];
  readonly forceInternalError?: boolean;
};

const toUserMap = (users: readonly User[]): ReadonlyMap<string, User> => {
  return users.reduce<Map<string, User>>((accumulator, user) => {
    accumulator.set(user.id, user);
    return accumulator;
  }, new Map<string, User>());
};

export const createFakeUserRepository = (
  config: FakeUserRepoConfig = {},
): UserRepository => {
  const userMap = toUserMap(config.users ?? []);

  const findUserById = async ({ userId }: FindUserByIdInput): Promise<Result<User, AppError>> => {
    if (config.forceInternalError === true) {
      return err(createInternalServerError('forced internal error'));
    }

    const user = userMap.get(userId);

    if (user === undefined) {
      return err(createNotFoundError('User not found'));
    }

    return ok(user);
  };

  return {
    findUserById,
  };
};
