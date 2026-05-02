import { describe, expect, test } from 'vitest';
import { createApp } from '../../../../src/app';
import {
  GenerateOutlineResponseSchema,
  GenerateReportResponseSchema,
} from '../../../../src/features/ai/ai-schema';
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

describe('POST /api/ai/generate-outline', () => {
  test('200: outline を生成できる', async () => {
    const reportRepository = createFakeReportRepository();
    const app = createApp({
      logger,
      reportRepository,
      userRepository,
    });

    const response = await app.request('/api/ai/generate-outline', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        overview: 'AI レポートの概要',
        aiMode: 'speed',
        wordCount: {
          minWordCount: 500,
          maxWordCount: 1000,
        },
      }),
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    const parsed = GenerateOutlineResponseSchema.safeParse(json);

    expect(parsed.success).toBe(true);
  });

  test('409: 既存outlineありで overwriteExisting 未指定は conflict', async () => {
    const reportRepository = createFakeReportRepository({
      initialOutlineByUserId: {
        u123: {
          userId: 'u123',
          overview: '既存概要',
          title: '既存タイトル',
          items: [
            {
              title: '導入',
              summary: '既存',
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

    const response = await app.request('/api/ai/generate-outline', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        overview: '新しい概要',
        aiMode: 'turbo',
        wordCount: {
          minWordCount: 1000,
          maxWordCount: 2000,
        },
      }),
    });

    expect(response.status).toBe(409);
    const json = await response.json();

    expect(json).toEqual({ error: 'Outline already exists' });
  });

  test('200: 既存outlineありでも overwriteExisting=true なら上書きできる', async () => {
    const reportRepository = createFakeReportRepository({
      initialOutlineByUserId: {
        u123: {
          userId: 'u123',
          overview: '既存概要',
          title: '既存タイトル',
          items: [
            {
              title: '導入',
              summary: '既存',
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

    const response = await app.request('/api/ai/generate-outline', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        overview: '上書き概要',
        aiMode: 'turbo',
        wordCount: {
          minWordCount: 1000,
          maxWordCount: 2000,
        },
        overwriteExisting: true,
      }),
    });

    expect(response.status).toBe(200);
  });

  test('400: overview が空白のみならバリデーションエラー', async () => {
    const reportRepository = createFakeReportRepository();
    const app = createApp({
      logger,
      reportRepository,
      userRepository,
    });

    const response = await app.request('/api/ai/generate-outline', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        overview: '   ',
        aiMode: 'speed',
        wordCount: {
          minWordCount: 500,
          maxWordCount: 1000,
        },
      }),
    });

    expect(response.status).toBe(400);
  });
});

describe('POST /api/ai/generate-report', () => {
  test('200: outline から本文を生成できる', async () => {
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

    const response = await app.request('/api/ai/generate-report', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        tone: 'balanced',
      }),
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    const parsed = GenerateReportResponseSchema.safeParse(json);

    expect(parsed.success).toBe(true);
  });

  test('404: outline がない場合は not found', async () => {
    const reportRepository = createFakeReportRepository();
    const app = createApp({
      logger,
      reportRepository,
      userRepository,
    });

    const response = await app.request('/api/ai/generate-report', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        tone: 'formal',
      }),
    });

    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json).toEqual({ error: 'Outline not found' });
  });
});
