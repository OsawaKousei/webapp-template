import type { Result } from 'neverthrow';
import type { AppError } from '@/shared/errors/app-error';
import { CURRENT_USER_ID } from '../auth/current-user';
import type { UserRepository } from './user-repo';
import type { ReportSummary, UserProfile } from './user-schema';

type GetUserByIdInput = {
  readonly userId: string;
  readonly userRepository: UserRepository;
};

type GetCurrentUserInput = {
  readonly userRepository: UserRepository;
};

type GetMyReportsInput = {
  readonly userRepository: UserRepository;
};

export const getUserById = async ({
  userId,
  userRepository,
}: GetUserByIdInput): Promise<Result<UserProfile, AppError>> => {
  return userRepository.findUserById({ userId });
};

export const getCurrentUser = async ({
  userRepository,
}: GetCurrentUserInput): Promise<Result<UserProfile, AppError>> => {
  return userRepository.findUserById({ userId: CURRENT_USER_ID });
};

export const getMyReports = async ({
  userRepository,
}: GetMyReportsInput): Promise<Result<ReportSummary[], AppError>> => {
  return userRepository.findReportsByUserId({ userId: CURRENT_USER_ID });
};
