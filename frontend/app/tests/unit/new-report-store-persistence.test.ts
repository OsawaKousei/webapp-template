import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearPersistedState,
  hydrateState,
  persistState,
} from '@/features/new-report/stores/new-report-store-persistence';
import { initialState } from '@/features/new-report/stores/new-report-store-state';

describe('new-report-store-persistence', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('hydrateState は保存値を正規化して復元する', () => {
    window.sessionStorage.setItem('report_current_phase', '4');
    window.sessionStorage.setItem('report_completed_phases', '[1,2,3]');
    window.sessionStorage.setItem('report_text_overview', '概要本文');
    window.sessionStorage.setItem('report_word_count', '2000');
    window.sessionStorage.setItem('report_model', 'turbo');
    window.sessionStorage.setItem('report_is_file_upload', 'true');
    window.sessionStorage.setItem(
      'report_overview_file',
      JSON.stringify({ referenceId: 'ov-1', name: 'task.pdf', size: 120 }),
    );
    window.sessionStorage.setItem('report_title', '保存済みタイトル');
    window.sessionStorage.setItem(
      'reference_uploaded_files',
      JSON.stringify([
        { referenceId: 'ref-1', name: 'A.pdf', size: 10 },
        { invalid: true },
      ]),
    );
    window.sessionStorage.setItem('tone_selection', 'desu-masu');
    window.sessionStorage.setItem(
      'outline_items',
      JSON.stringify([
        { order: 9, title: '章A', summary: '要約A' },
        { order: 4, title: '章B', summary: '要約B' },
        { order: 'x', title: 'invalid', summary: 'invalid' },
      ]),
    );

    const hydrated = hydrateState();

    expect(hydrated).toEqual({
      currentPhase: 4,
      completedPhases: [1, 2, 3],
      overview: '概要本文',
      wordCount: '2000',
      aiMode: 'turbo',
      overviewMode: 'file',
      overviewFile: { referenceId: 'ov-1', name: 'task.pdf', size: 120 },
      title: '保存済みタイトル',
      uploadedFiles: [{ referenceId: 'ref-1', name: 'A.pdf', size: 10 }],
      tone: 'balanced',
      outline: [
        { order: 1, title: '章A', summary: '要約A' },
        { order: 2, title: '章B', summary: '要約B' },
      ],
    });
  });

  it('clearPersistedState は persistState で保存された項目を削除する', () => {
    persistState({
      ...initialState,
      currentPhase: 2,
      completedPhases: [1],
      overview: 'clear target',
      uploadedFiles: [{ referenceId: 'x', name: 'x.txt', size: 1 }],
      outline: [{ order: 1, title: '章', summary: '要約' }],
    });

    clearPersistedState();

    expect(window.sessionStorage.getItem('report_current_phase')).toBeNull();
    expect(window.sessionStorage.getItem('report_completed_phases')).toBeNull();
    expect(window.sessionStorage.getItem('report_text_overview')).toBeNull();
    expect(window.sessionStorage.getItem('report_word_count')).toBeNull();
    expect(window.sessionStorage.getItem('report_model')).toBeNull();
    expect(window.sessionStorage.getItem('report_is_file_upload')).toBeNull();
    expect(window.sessionStorage.getItem('report_overview_file')).toBeNull();
    expect(window.sessionStorage.getItem('report_title')).toBeNull();
    expect(window.sessionStorage.getItem('reference_uploaded_files')).toBeNull();
    expect(window.sessionStorage.getItem('tone_selection')).toBeNull();
    expect(window.sessionStorage.getItem('outline_items')).toBeNull();
  });
});
