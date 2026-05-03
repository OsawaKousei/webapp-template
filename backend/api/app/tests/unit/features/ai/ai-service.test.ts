import { describe, expect, test } from 'vitest';
import {
  generateOutline,
  generateReport,
} from '../../../../src/features/ai/ai-service';
import { createFakeReportRepository } from '../../../fakes/fake-report-repo';

describe('ai-service', () => {
  test('generateOutline: outline がない場合に生成できる', async () => {
    const result = await generateOutline({
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

  test('generateOutline: 同一入力で繰り返し呼んでも成功する', async () => {
    const first = await generateOutline({
      request: {
        overview: '新しい概要',
        aiMode: 'turbo',
        wordCount: {
          minWordCount: 1000,
          maxWordCount: 2000,
        },
      },
    });

    const second = await generateOutline({
      request: {
        overview: '新しい概要',
        aiMode: 'turbo',
        wordCount: {
          minWordCount: 1000,
          maxWordCount: 2000,
        },
      },
    });

    expect(first.isOk()).toBe(true);
    expect(second.isOk()).toBe(true);
  });

  test('generateReport: overview から本文を生成して保存できる', async () => {
    const reportRepository = createFakeReportRepository();

    const result = await generateReport({
      reportRepository,
      request: {
        overview: '概要',
        tone: 'balanced',
      },
    });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) {
      return;
    }

    expect(result.value.reportId.length).toBeGreaterThan(0);
    expect(result.value.content.length).toBeGreaterThan(0);
  });

});
