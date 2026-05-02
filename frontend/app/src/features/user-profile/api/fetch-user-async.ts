import { z } from 'zod';
import { err, ok, type Result } from 'neverthrow';

const USER_ENDPOINT = '/api/user';

const userSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().min(1),
  status: z.string().min(1),
});

type User = z.infer<typeof userSchema>;

const mockUser: User = {
  id: 'demo-user-001',
  name: 'Demo User',
  email: 'demo.user@example.com',
  status: 'active',
};

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error occurred while fetching user profile';
};

const parseJsonResponseAsync = async (
  response: Response,
): Promise<Result<unknown, Error>> => {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return err(
      new Error(
        'API did not return JSON response. Backend might be unavailable.',
      ),
    );
  }

  try {
    const responseJson: unknown = await response.json();
    return ok(responseJson);
  } catch (error: unknown) {
    return err(new Error(toErrorMessage(error), { cause: error }));
  }
};

const fetchUserResultAsync = async (): Promise<Result<User, Error>> => {
  try {
    const response = await fetch(USER_ENDPOINT);

    if (!response.ok) {
      return err(new Error('Failed to fetch user profile'));
    }

    const parsedJsonResult = await parseJsonResponseAsync(response);

    if (parsedJsonResult.isErr()) {
      return import.meta.env.DEV ? ok(mockUser) : err(parsedJsonResult.error);
    }

    const parseResult = userSchema.safeParse(parsedJsonResult.value);

    if (!parseResult.success) {
      return import.meta.env.DEV
        ? ok(mockUser)
        : err(new Error('User response shape is invalid'));
    }

    return ok(parseResult.data);
  } catch (error: unknown) {
    if (import.meta.env.DEV) {
      return ok(mockUser);
    }

    return err(new Error(toErrorMessage(error), { cause: error }));
  }
};

export const fetchUserAsync = async (): Promise<User> => {
  const fetchResult = await fetchUserResultAsync();

  if (fetchResult.isOk()) {
    return fetchResult.value;
  }

  throw fetchResult.error;
};
