import { describe, expect, test } from 'vitest';
import { createApp } from '../../../../src/app';
import {
  ErrorResponseSchema,
  ReportSummaryListSchema,
  UserProfileSchema,
} from '../../../../src/features/user/user-schema';
import { CURRENT_USER_ID } from '../../../../src/features/auth/current-user';
import { createLogger } from '../../../../src/infrastructure/logging/logger';
import { createFakeReportRepository } from '../../../fakes/fake-report-repo';
import { createFakeUserRepository } from '../../../fakes/fake-user-repo';

const logger = createLogger({ level: 'silent' });

describe('GET /api/users/me', () => {
  test('200: ユーザー契約を満たすレスポンスを返す', async () => {
    const userRepository = createFakeUserRepository({
      users: [
        {
          id: CURRENT_USER_ID,
          displayName: 'Gemini Node',
          email: 'gemini@example.com',
          subscriptionPlan: 'standard',
          credits: 120,
        },
      ],
    });
    const reportRepository = createFakeReportRepository();
    const app = createApp({
      logger,
      reportRepository,
      userRepository,
    });

    const response = await app.request('/api/users/me');

    expect(response.status).toBe(200);
    const json = await response.json();
    const parsed = UserProfileSchema.safeParse(json);

    expect(parsed.success).toBe(true);
  });

  test('404: NOT_FOUND をエラースキーマで返す', async () => {
    const userRepository = createFakeUserRepository();
    const reportRepository = createFakeReportRepository();
    const app = createApp({
      logger,
      reportRepository,
      userRepository,
    });

    const response = await app.request('/api/users/me');

    expect(response.status).toBe(404);
    const json = await response.json();
    const parsed = ErrorResponseSchema.safeParse(json);

    expect(parsed.success).toBe(true);
    expect(json).toEqual({ error: 'User not found' });
  });
});

describe('GET /api/users/me/reports', () => {
  test('200: レポート一覧契約を満たすレスポンスを返す', async () => {
    const userRepository = createFakeUserRepository({
      users: [
        {
          id: CURRENT_USER_ID,
          displayName: 'Gemini Node',
          email: 'gemini@example.com',
          subscriptionPlan: 'standard',
          credits: 120,
        },
      ],
      reportsByUserId: {
        [CURRENT_USER_ID]: [
          {
            reportId: 'r-001',
            title: 'AI Report Draft',
            lastModifiedAt: '2026-05-01T10:00:00.000Z',
          },
        ],
      },
    });
    const reportRepository = createFakeReportRepository();
    const app = createApp({
      logger,
      reportRepository,
      userRepository,
    });

    const response = await app.request('/api/users/me/reports');

    expect(response.status).toBe(200);
    const json = await response.json();
    const parsed = ReportSummaryListSchema.safeParse(json);

    expect(parsed.success).toBe(true);
  });
});
