import { describe, expect, test } from 'vitest';
import { createApp } from '../../../../src/app';
import { CURRENT_USER_ID } from '../../../../src/features/auth/current-user';
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
      id: CURRENT_USER_ID,
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

  test('200: 同じ入力で連続生成しても成功する', async () => {
    const reportRepository = createFakeReportRepository();
    const app = createApp({
      logger,
      reportRepository,
      userRepository,
    });

    const first = await app.request('/api/ai/generate-outline', {
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

    const second = await app.request('/api/ai/generate-outline', {
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

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
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
  test('200: overview から本文を生成できる', async () => {
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
        overview: '概要',
        tone: 'balanced',
      }),
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    const parsed = GenerateReportResponseSchema.safeParse(json);

    expect(parsed.success).toBe(true);
  });

  test('200: 生成後に GET /api/reports/{reportId} で本文を取得できる', async () => {
    const reportRepository = createFakeReportRepository();
    const app = createApp({
      logger,
      reportRepository,
      userRepository,
    });

    const generateResponse = await app.request('/api/ai/generate-report', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        overview: '概要',
        tone: 'balanced',
      }),
    });

    expect(generateResponse.status).toBe(200);
    const generated = await generateResponse.json();

    const getResponse = await app.request(`/api/reports/${generated.reportId}`);
    expect(getResponse.status).toBe(200);
    const detail = await getResponse.json();

    expect(detail.reportId).toBe(generated.reportId);
    expect(detail.title).toBe(generated.title);
    expect(detail.content).toBe(generated.content);
  });

  test('400: tone が不正値ならバリデーションエラー', async () => {
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
        overview: '概要',
        tone: 'invalid',
      }),
    });

    expect(response.status).toBe(400);
  });
});
