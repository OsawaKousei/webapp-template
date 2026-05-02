import { describe, expect, test } from 'vitest';
import { createApp } from '../../../../src/app';
import { CURRENT_USER_ID } from '../../../../src/features/auth/current-user';
import {
  OutlineSchema,
  ReportDetailSchema,
} from '../../../../src/features/report/report-schema';
import { createLogger } from '../../../../src/infrastructure/logging/logger';
import { createFakeReportRepository } from '../../../fakes/fake-report-repo';
import { createFakeUserRepository } from '../../../fakes/fake-user-repo';

const logger = createLogger({ level: 'silent' });

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
        [CURRENT_USER_ID]: {
          userId: CURRENT_USER_ID,
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

  test('GET /api/reports/:reportId: report がある場合は契約を満たす', async () => {
    const reportRepository = createFakeReportRepository({
      initialReportByReportId: {
        'r-100': {
          reportId: 'r-100',
          userId: CURRENT_USER_ID,
          title: '保存済みタイトル',
          content: '保存済み本文',
          references: [],
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

    const response = await app.request('/api/reports/r-100');

    expect(response.status).toBe(200);
    const json = await response.json();
    const parsed = ReportDetailSchema.safeParse(json);

    expect(parsed.success).toBe(true);
  });

  test('POST /api/reports/:reportId: report を保存できる', async () => {
    const reportRepository = createFakeReportRepository();
    const app = createApp({
      logger,
      reportRepository,
      userRepository,
    });

    const response = await app.request('/api/reports/r-200', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        title: '編集後タイトル',
        content: '編集後本文',
      }),
    });

    expect(response.status).toBe(200);
    const json = await response.json();

    expect(json.reportId).toBe('r-200');
    expect(json.title).toBe('編集後タイトル');
  });

  test('POST /api/reports/:reportId: title が空白のみなら 400', async () => {
    const reportRepository = createFakeReportRepository();
    const app = createApp({
      logger,
      reportRepository,
      userRepository,
    });

    const response = await app.request('/api/reports/r-201', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        title: '   ',
        content: '本文',
      }),
    });

    expect(response.status).toBe(400);
  });

  test('GET /api/reports/:reportId: report がない場合は 404', async () => {
    const reportRepository = createFakeReportRepository();
    const app = createApp({
      logger,
      reportRepository,
      userRepository,
    });

    const response = await app.request('/api/reports/r-missing');

    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json).toEqual({ error: 'Report not found' });
  });
});
