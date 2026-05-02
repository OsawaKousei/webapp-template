import { describe, expect, test } from 'vitest';
import { generateOutline } from '../../../../src/features/ai/ai-service';
import { createFakeReportRepository } from '../../../fakes/fake-report-repo';

describe('ai-service', () => {
  test('generateOutline: outline がない場合に生成できる', async () => {
    const reportRepository = createFakeReportRepository();

    const result = await generateOutline({
      reportRepository,
      request: {
        overview: 'AI レポートの構成案',
        aiMode: 'speed',
        wordCount: {
          minWordCount: 500,
          maxWordCount: 1000,
        },
      },
    });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) {
      return;
    }

    expect(result.value.outline.items.length).toBeGreaterThan(0);
  });

  test('generateOutline: 既存outlineありでoverwriteExisting未指定はCONFLICT', async () => {
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

    const result = await generateOutline({
      reportRepository,
      request: {
        overview: '新しい概要',
        aiMode: 'turbo',
        wordCount: {
          minWordCount: 1000,
          maxWordCount: 2000,
        },
      },
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) {
      return;
    }

    expect(result.error.type).toBe('CONFLICT');
  });
});
