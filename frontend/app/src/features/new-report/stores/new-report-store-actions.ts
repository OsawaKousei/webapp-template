import type {
  NewReportActions,
  NewReportState,
} from './new-report-store-types';
import { initialState } from './new-report-store-state';
import {
  clearPersistedState,
  hydrateState,
  persistState,
} from './new-report-store-persistence';

type ActionContext = {
  readonly setState: (updater: (prev: NewReportState) => NewReportState) => void;
  readonly getState: () => NewReportState;
  readonly withPersist: (partial: Partial<NewReportState>) => void;
};

export const createNewReportActions = (
  context: ActionContext,
): NewReportActions => {
  return {
    initialize: () => {
      context.setState((state) => {
        const next = {
          ...state,
          ...initialState,
          ...hydrateState(),
          actions: state.actions,
        };

        persistState(next);
        return next;
      });
    },
    clear: () => {
      context.setState(() => {
        clearPersistedState();

        return {
          ...initialState,
          actions: context.getState().actions,
        };
      });
    },
    setIsBusy: (value) => {
      context.setState((prev) => {
        return {
          ...prev,
          isBusy: value,
        };
      });
    },
    setErrorMessage: (value) => {
      context.setState((prev) => {
        return {
          ...prev,
          errorMessage: value,
        };
      });
    },
    addCompletedPhase: (phase) => {
      if (context.getState().completedPhases.includes(phase)) {
        return;
      }

      context.withPersist({
        completedPhases: [...context.getState().completedPhases, phase],
      });
    },
    setCurrentPhase: (phase) => {
      context.withPersist({ currentPhase: phase });
    },
    setCompletedPhases: (phases) => {
      context.withPersist({ completedPhases: phases });
    },
    setTitle: (value) => {
      context.withPersist({ title: value });
    },
    setOverview: (value) => {
      context.withPersist({ overview: value });
    },
    setOverviewMode: (mode) => {
      context.withPersist({ overviewMode: mode });
    },
    setOverviewFile: (file) => {
      context.withPersist({ overviewFile: file });
    },
    setWordCount: (value) => {
      context.withPersist({ wordCount: value });
    },
    setAiMode: (value) => {
      context.withPersist({ aiMode: value });
    },
    addReference: (file) => {
      context.withPersist({
        uploadedFiles: [...context.getState().uploadedFiles, file],
      });
    },
    removeReference: (referenceId) => {
      context.withPersist({
        uploadedFiles: context.getState().uploadedFiles.filter((item) => {
          return item.referenceId !== referenceId;
        }),
      });
    },
    setTone: (value) => {
      context.withPersist({ tone: value });
    },
    setOutline: (outline) => {
      context.withPersist({ outline });
    },
    updateOutlineItem: (item) => {
      const nextOutline = context.getState().outline.map((current) => {
        return current.order === item.order ? item : current;
      });

      context.withPersist({ outline: nextOutline });
    },
    deleteOutlineItem: (order) => {
      const nextOutline = context
        .getState()
        .outline.filter((item) => {
          return item.order !== order;
        })
        .map((item, index) => {
          return {
            ...item,
            order: index + 1,
          };
        });

      context.withPersist({ outline: nextOutline });
    },
    addOutlineItem: () => {
      const nextOrder = context.getState().outline.length + 1;

      context.withPersist({
        outline: [
          ...context.getState().outline,
          {
            order: nextOrder,
            title: `新しい章 ${nextOrder}`,
            summary: '章の概要を入力してください',
          },
        ],
      });
    },
  };
};
