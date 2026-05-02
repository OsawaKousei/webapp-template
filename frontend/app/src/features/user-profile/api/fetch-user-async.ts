import { UserSchema, type User } from '@my-app/types';

const USER_ENDPOINT = '/api/user';

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error occurred while fetching user profile';
};

export const fetchUserAsync = async (): Promise<User> => {
  try {
    const response = await fetch(USER_ENDPOINT);

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const responseJson: unknown = await response.json();
    const parseResult = UserSchema.safeParse(responseJson);

    if (!parseResult.success) {
      throw new Error('User response shape is invalid');
    }

    return parseResult.data;
  } catch (error: unknown) {
    throw new Error(toErrorMessage(error), { cause: error });
  }
};