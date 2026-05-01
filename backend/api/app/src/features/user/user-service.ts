import type { Result } from 'neverthrow';
import type { AppError } from '../../../shared/errors/app-error';
import type { UserRepository } from './user-repo';
import type { User } from './user-schema';

type GetUserByIdInput = {
  readonly userId: string;
  readonly userRepository: UserRepository;
};

export const getUserById = async ({
  userId,
  userRepository,
}: GetUserByIdInput): Promise<Result<User, AppError>> => {
  return userRepository.findUserById({ userId });
};