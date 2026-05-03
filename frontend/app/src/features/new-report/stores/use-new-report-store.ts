import { create } from 'zustand';
import { createNewReportActions } from './new-report-store-actions';
import { persistState } from './new-report-store-persistence';
import { initialState } from './new-report-store-state';
import type { NewReportState } from './new-report-store-types';

export const useNewReportStore = create<NewReportState>((set, get) => {
  const withPersist = (partial: Partial<NewReportState>) => {
    set((prev) => {
      const next = {
        ...prev,
        ...partial,
      };

      persistState(next);
      return next;
    });
  };

  const actions = createNewReportActions({
    setState: (updater) => {
      set((prev) => {
        return updater(prev);
      });
    },
    getState: get,
    withPersist,
  });

  return {
    ...initialState,
    actions,
  };
});

export type {
  NewReportState,
  OutlineItem,
  OverviewMode,
  Tone,
  UploadedReference,
} from './new-report-store-types';
