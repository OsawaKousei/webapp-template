import { describe, expect, it } from 'vitest';
import type {
  NewReportActions,
  NewReportState,
  OutlineItem,
} from '@/features/new-report/stores/new-report-store-types';
import { createNewReportActions } from '@/features/new-report/stores/new-report-store-actions';
import { initialState } from '@/features/new-report/stores/new-report-store-state';

const createEmptyActions = (): NewReportActions => {
  return {
    initialize: () => undefined,
    clear: () => undefined,
    setIsBusy: () => undefined,
    setErrorMessage: () => undefined,
    addCompletedPhase: () => undefined,
    setCurrentPhase: () => undefined,
    setCompletedPhases: () => undefined,
    setTitle: () => undefined,
    setOverview: () => undefined,
    setOverviewMode: () => undefined,
    setOverviewFile: () => undefined,
    setWordCount: () => undefined,
    setAiMode: () => undefined,
    addReference: () => undefined,
    removeReference: () => undefined,
    setTone: () => undefined,
    setOutline: () => undefined,
    updateOutlineItem: () => undefined,
    deleteOutlineItem: () => undefined,
    addOutlineItem: () => undefined,
  };
};

type Harness = {
  readonly actions: NewReportActions;
  readonly getState: () => NewReportState;
  readonly withPersistCalls: ReadonlyArray<Partial<NewReportState>>;
};

const createHarness = (
  partial: Partial<NewReportState> = {},
): Harness => {
  const state: NewReportState = {
    ...initialState,
    ...partial,
    actions: createEmptyActions(),
  };

  const withPersistCalls: Array<Partial<NewReportState>> = [];

  const setState = (updater: (prev: NewReportState) => NewReportState) => {
    const next = updater(state);
    Object.assign(state, next);
  };

  const withPersist = (patch: Partial<NewReportState>) => {
    withPersistCalls.push(patch);
    Object.assign(state, patch);
  };

  const actions = createNewReportActions({
    setState,
    getState: () => state,
    withPersist,
  });

  return {
    actions,
    getState: () => state,
    withPersistCalls,
  };
};

describe('createNewReportActions', () => {
  it('addCompletedPhase は重複するフェーズを追加しない', () => {
    const harness = createHarness({ completedPhases: [1] });

    harness.actions.addCompletedPhase(1);

    expect(harness.getState().completedPhases).toEqual([1]);
    expect(harness.withPersistCalls).toHaveLength(0);
  });

  it('deleteOutlineItem は削除後に order を詰める', () => {
    const outline: readonly OutlineItem[] = [
      { order: 1, title: '導入', summary: '導入要約' },
      { order: 2, title: '分析', summary: '分析要約' },
      { order: 3, title: '結論', summary: '結論要約' },
    ];
    const harness = createHarness({ outline });

    harness.actions.deleteOutlineItem(2);

    expect(harness.getState().outline).toEqual([
      { order: 1, title: '導入', summary: '導入要約' },
      { order: 2, title: '結論', summary: '結論要約' },
    ]);
  });

  it('addOutlineItem は連番タイトル付きの章を末尾追加する', () => {
    const harness = createHarness({
      outline: [{ order: 1, title: '既存章', summary: '既存要約' }],
    });

    harness.actions.addOutlineItem();

    expect(harness.getState().outline).toEqual([
      { order: 1, title: '既存章', summary: '既存要約' },
      { order: 2, title: '新しい章 2', summary: '章の概要を入力してください' },
    ]);
  });
});
