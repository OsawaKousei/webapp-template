import { err, ok, type Result } from 'neverthrow';
import type { UserRepository } from '../../features/user/user-repo';
import type { User } from '../../features/user/user-schema';
import {
  createInternalServerError,
  createNotFoundError,
  type AppError,
} from '../../../shared/errors/app-error';

const userRecordById: Readonly<Record<string, User>> = {
  u123: {
    id: 'u123',
    name: 'Gemini Node',
    email: 'gemini@example.com',
    status: 'active',
  },
};

const findUserFromRecord = (userId: string): Result<User, AppError> => {
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
  };
};