import { describe, expect, test } from 'vitest';
import {
  getCurrentUser,
  getMyReports,
  getUserById,
} from '../../../../src/features/user/user-service';
import { createFakeUserRepository } from '../../../fakes/fake-user-repo';

const activeUser = {
  id: 'u123',
  displayName: 'Gemini Node',
  email: 'gemini@example.com',
  subscriptionPlan: 'standard',
  credits: 120,
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

  test('getMyReports: カレントユーザーのレポート一覧を返す', async () => {
    const userRepository = createFakeUserRepository({
      users: [activeUser],
      reportsByUserId: {
        u123: [
          {
            reportId: 'r-001',
            title: 'AI Report Draft',
            lastModifiedAt: '2026-05-01T10:00:00.000Z',
          },
        ],
      },
    });

    const result = await getMyReports({ userRepository });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) {
      return;
    }

    expect(result.value).toHaveLength(1);
    expect(result.value[0]?.reportId).toBe('r-001');
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
