import type { Result } from 'neverthrow';
import type { AppError } from '../../../shared/errors/app-error';
import type { UserRepository } from './user-repo';
import type { User } from './user-schema';

type GetUserByIdInput = {
  readonly userId: string;
  readonly userRepository: UserRepository;
};

type GetCurrentUserInput = {
  readonly userRepository: UserRepository;
};

const CURRENT_USER_ID = 'u123';

export const getUserById = async ({
  userId,
  userRepository,
}: GetUserByIdInput): Promise<Result<User, AppError>> => {
  return userRepository.findUserById({ userId });
};

export const getCurrentUser = async ({
  userRepository,
}: GetCurrentUserInput): Promise<Result<User, AppError>> => {
  return userRepository.findUserById({ userId: CURRENT_USER_ID });
};