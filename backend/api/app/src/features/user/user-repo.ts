import type { Result } from 'neverthrow';
import type { AppError } from '../../../shared/errors/app-error';
import type { User } from './user-schema';

export type FindUserByIdInput = {
  readonly userId: string;
};

export type UserRepository = {
  readonly findUserById: (
    input: FindUserByIdInput,
  ) => Promise<Result<User, AppError>>;
};