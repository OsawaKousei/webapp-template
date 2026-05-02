import { describe, expect, test } from 'vitest';
import { createApp } from '../../../../src/app';
import { OutlineSchema } from '../../../../src/features/report/report-schema';
import { createLogger } from '../../../../src/infrastructure/logging/logger';
import { createFakeReportRepository } from '../../../fakes/fake-report-repo';
import { createFakeUserRepository } from '../../../fakes/fake-user-repo';

const logger = createLogger({ level: 'silent' });

const userRepository = createFakeUserRepository({
  users: [
    {
      id: 'u123',
      displayName: 'Gemini Node',
      email: 'gemini@example.com',
      subscriptionPlan: 'standard',
      credits: 120,
    },
  ],
});

describe('report-router', () => {
  test('GET /api/reports/outline: outline がない場合 null を返す', async () => {
    const reportRepository = createFakeReportRepository();
    const app = createApp({
      logger,
      reportRepository,
      userRepository,
    });

    const response = await app.request('/api/reports/outline');

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toBeNull();
  });

  test('GET /api/reports/outline: outline がある場合契約を満たす', async () => {
    const reportRepository = createFakeReportRepository({
      initialOutlineByUserId: {
        u123: {
          userId: 'u123',
          overview: '概要',
          title: 'タイトル',
          items: [
            {
              title: '導入',
              summary: '要点',
              order: 1,
            },
          ],
          createdAt: '2026-05-01T10:00:00.000Z',
          updatedAt: '2026-05-01T10:00:00.000Z',
        },
      },
    });
    const app = createApp({
      logger,
      reportRepository,
      userRepository,
    });

    const response = await app.request('/api/reports/outline');

    expect(response.status).toBe(200);
    const json = await response.json();
    const parsed = OutlineSchema.safeParse(json);

    expect(parsed.success).toBe(true);
  });

  test('DELETE /api/reports/outline: success を返す', async () => {
    const reportRepository = createFakeReportRepository();
    const app = createApp({
      logger,
      reportRepository,
      userRepository,
    });

    const response = await app.request('/api/reports/outline', {
      method: 'DELETE',
    });

    expect(response.status).toBe(200);
    const json = await response.json();

    expect(json).toEqual({ success: true });
  });
});
