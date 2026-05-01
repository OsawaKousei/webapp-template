import { describe, expect, test } from 'vitest';
import { createApp } from '../../../../src/app';
import {
  ErrorResponseSchema,
  UserSchema,
} from '../../../../src/features/user/user-schema';
import { createFakeUserRepository } from '../../../fakes/fake-user-repo';

describe('GET /api/user', () => {
  test('200: ユーザー契約を満たすレスポンスを返す', async () => {
    const userRepository = createFakeUserRepository({
      users: [
        {
          id: 'u123',
          name: 'Gemini Node',
          email: 'gemini@example.com',
          status: 'active',
        },
      ],
    });
    const app = createApp({ userRepository });

    const response = await app.request('/api/user');

    expect(response.status).toBe(200);
    const json = await response.json();
    const parsed = UserSchema.safeParse(json);

    expect(parsed.success).toBe(true);
  });

  test('404: NOT_FOUND をエラースキーマで返す', async () => {
    const userRepository = createFakeUserRepository();
    const app = createApp({ userRepository });

    const response = await app.request('/api/user');

    expect(response.status).toBe(404);
    const json = await response.json();
    const parsed = ErrorResponseSchema.safeParse(json);

    expect(parsed.success).toBe(true);
    expect(json).toEqual({ error: 'User not found' });
  });

  test('500: INTERNAL_SERVER_ERROR をエラースキーマで返す', async () => {
    const userRepository = createFakeUserRepository({
      forceInternalError: true,
    });
    const app = createApp({ userRepository });

    const response = await app.request('/api/user');

    expect(response.status).toBe(500);
    const json = await response.json();
    const parsed = ErrorResponseSchema.safeParse(json);

    expect(parsed.success).toBe(true);
    expect(json).toEqual({ error: 'forced internal error' });
  });
});
