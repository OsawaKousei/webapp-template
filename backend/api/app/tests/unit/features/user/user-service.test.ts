import { describe, expect, test } from 'vitest';
import { getCurrentUser, getUserById } from '../../../../src/features/user/user-service';
import { createFakeUserRepository } from '../../../fakes/fake-user-repo';

const activeUser = {
  id: 'u123',
  name: 'Gemini Node',
  email: 'gemini@example.com',
  status: 'active',
} as const;

describe('user-service', () => {
  test('getUserById: 既存ユーザーを返す', async () => {
    const userRepository = createFakeUserRepository({
      users: [activeUser],
    });

    const result = await getUserById({
      userId: 'u123',
      userRepository,
    });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) {
      return;
    }

    expect(result.value.id).toBe('u123');
    expect(result.value.email).toBe('gemini@example.com');
  });

  test('getCurrentUser: カレントユーザー不在時は NOT_FOUND', async () => {
    const userRepository = createFakeUserRepository();

    const result = await getCurrentUser({ userRepository });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) {
      return;
    }

    expect(result.error.type).toBe('NOT_FOUND');
    expect(result.error.message).toBe('User not found');
  });
});
