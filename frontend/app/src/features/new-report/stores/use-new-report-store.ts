import { create } from 'zustand';

type OverviewMode = 'text' | 'file';
type Tone = 'desu-masu' | 'dearu-da';

type UploadedReference = {
  readonly referenceId: string;
  readonly name: string;
  readonly size: number;
};

type OutlineItem = {
  readonly order: number;
  readonly title: string;
  readonly summary: string;
};

type NewReportState = {
  readonly currentPhase: number;
  readonly completedPhases: readonly number[];
  readonly isBusy: boolean;
  readonly errorMessage: string | null;
  readonly title: string;
  readonly overview: string;
  readonly overviewMode: OverviewMode;
  readonly overviewFile: UploadedReference | null;
  readonly wordCount: string;
  readonly aiMode: string;
  readonly uploadedFiles: readonly UploadedReference[];
  readonly tone: Tone;
  readonly outline: readonly OutlineItem[];
  readonly actions: {
    readonly initialize: () => void;
    readonly clear: () => void;
    readonly setIsBusy: (value: boolean) => void;
    readonly setErrorMessage: (value: string | null) => void;
    readonly addCompletedPhase: (phase: number) => void;
    readonly setCurrentPhase: (phase: number) => void;
    readonly setCompletedPhases: (phases: readonly number[]) => void;
    readonly setTitle: (value: string) => void;
    readonly setOverview: (value: string) => void;
    readonly setOverviewMode: (mode: OverviewMode) => void;
    readonly setOverviewFile: (file: UploadedReference | null) => void;
    readonly setWordCount: (value: string) => void;
    readonly setAiMode: (value: string) => void;
    readonly addReference: (file: UploadedReference) => void;
    readonly removeReference: (referenceId: string) => void;
    readonly setTone: (value: Tone) => void;
    readonly setOutline: (outline: readonly OutlineItem[]) => void;
    readonly updateOutlineItem: (item: OutlineItem) => void;
    readonly deleteOutlineItem: (order: number) => void;
    readonly addOutlineItem: () => void;
  };
};

type HydratedState = {
  currentPhase?: number;
  completedPhases?: readonly number[];
  overview?: string;
  wordCount?: string;
  aiMode?: string;
  overviewMode?: OverviewMode;
  overviewFile?: UploadedReference | null;
  title?: string;
  uploadedFiles?: readonly UploadedReference[];
  tone?: Tone;
  outline?: readonly OutlineItem[];
};

const KEY = {
  currentPhase: 'report_current_phase',
  completedPhases: 'report_completed_phases',
  overview: 'report_text_overview',
  wordCount: 'report_word_count',
  aiMode: 'report_model',
  overviewMode: 'report_is_file_upload',
  overviewFile: 'report_overview_file',
  title: 'report_title',
  references: 'reference_uploaded_files',
  tone: 'tone_selection',
  outline: 'outline_items',
} as const;

const PERSIST_KEYS = Object.values(KEY);

const initialState = {
  currentPhase: 1,
  completedPhases: [] as readonly number[],
  isBusy: false,
  errorMessage: null,
  title: '新規レポート',
  overview: '',
  overviewMode: 'text' as const,
  overviewFile: null,
  wordCount: '1500',
  aiMode: 'speed',
  uploadedFiles: [] as readonly UploadedReference[],
  tone: 'desu-masu' as const,
  outline: [] as readonly OutlineItem[],
};

const safeSessionStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage;
};

const persistState = (state: NewReportState) => {
  const storage = safeSessionStorage();

  if (storage === null) {
    return;
  }

  storage.setItem(KEY.currentPhase, String(state.currentPhase));
  storage.setItem(KEY.completedPhases, JSON.stringify(state.completedPhases));
  storage.setItem(KEY.overview, state.overview);
  storage.setItem(KEY.wordCount, state.wordCount);
  storage.setItem(KEY.aiMode, state.aiMode);
  storage.setItem(KEY.overviewMode, String(state.overviewMode === 'file'));
  storage.setItem(KEY.overviewFile, JSON.stringify(state.overviewFile));
  storage.setItem(KEY.title, state.title);
  storage.setItem(KEY.references, JSON.stringify(state.uploadedFiles));
  storage.setItem(KEY.tone, state.tone);
  storage.setItem(KEY.outline, JSON.stringify(state.outline));
};

const clearPersistedState = () => {
  const storage = safeSessionStorage();

  if (storage === null) {
    return;
  }

  PERSIST_KEYS.forEach((key) => {
    storage.removeItem(key);
  });
};

const parseNumber = (value: string | null) => {
  if (value === null) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    return null;
  }

  return parsed;
};

const parseJson = <T>(value: string | null): T | null => {
  if (value === null) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const isOverviewMode = (value: string): value is OverviewMode => {
  return value === 'text' || value === 'file';
};

const isTone = (value: string): value is Tone => {
  return value === 'desu-masu' || value === 'dearu-da';
};

const isUploadedReference = (value: unknown): value is UploadedReference => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.referenceId === 'string' &&
    typeof record.name === 'string' &&
    typeof record.size === 'number'
  );
};

const isOutlineItem = (value: unknown): value is OutlineItem => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.order === 'number' &&
    typeof record.title === 'string' &&
    typeof record.summary === 'string'
  );
};

const hydrateState = (): HydratedState => {
  const storage = safeSessionStorage();

  if (storage === null) {
    return {};
  }

  const next: HydratedState = {};
  const storedPhase = parseNumber(storage.getItem(KEY.currentPhase));

  if (storedPhase !== null && storedPhase >= 1 && storedPhase <= 5) {
    next.currentPhase = storedPhase;
  }

  const storedCompletedPhases = parseJson<unknown[]>(
    storage.getItem(KEY.completedPhases),
  );

  if (
    storedCompletedPhases !== null &&
    Array.isArray(storedCompletedPhases) &&
    storedCompletedPhases.every((phase) => {
      return typeof phase === 'number';
    })
  ) {
    next.completedPhases = storedCompletedPhases;
  }

  const storedOverview = storage.getItem(KEY.overview);

  if (storedOverview !== null) {
    next.overview = storedOverview;
  }

  const storedWordCount = storage.getItem(KEY.wordCount);

  if (storedWordCount !== null) {
    next.wordCount = storedWordCount;
  }

  const storedAiMode = storage.getItem(KEY.aiMode);

  if (storedAiMode !== null) {
    next.aiMode = storedAiMode;
  }

  const storedOverviewModeRaw = storage.getItem(KEY.overviewMode);

  if (storedOverviewModeRaw !== null) {
    if (storedOverviewModeRaw === 'true') {
      next.overviewMode = 'file';
    }

    if (storedOverviewModeRaw === 'false') {
      next.overviewMode = 'text';
    }

    if (isOverviewMode(storedOverviewModeRaw)) {
      next.overviewMode = storedOverviewModeRaw;
    }
  }

  const storedOverviewFile = parseJson<unknown>(
    storage.getItem(KEY.overviewFile),
  );

  if (storedOverviewFile === null) {
    next.overviewFile = null;
  }

  if (isUploadedReference(storedOverviewFile)) {
    next.overviewFile = storedOverviewFile;
  }

  const storedTitle = storage.getItem(KEY.title);

  if (storedTitle !== null) {
    next.title = storedTitle;
  }

  const storedReferences = parseJson<unknown[]>(storage.getItem(KEY.references));

  if (storedReferences !== null && Array.isArray(storedReferences)) {
    next.uploadedFiles = storedReferences.filter((item) => {
      return isUploadedReference(item);
    });
  }

  const storedTone = storage.getItem(KEY.tone);

  if (storedTone !== null && isTone(storedTone)) {
    next.tone = storedTone;
  }

  const storedOutline = parseJson<unknown[]>(storage.getItem(KEY.outline));

  if (storedOutline !== null && Array.isArray(storedOutline)) {
    const normalizedOutline = storedOutline
      .filter((item) => {
        return isOutlineItem(item);
      })
      .map((item, index) => {
        return {
          ...item,
          order: index + 1,
        };
      });

    next.outline = normalizedOutline;
  }

  return next;
};

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

  return {
    ...initialState,
    actions: {
      initialize: () => {
        set((state) => {
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
        set(() => {
          clearPersistedState();
          return {
            ...initialState,
            actions: get().actions,
          };
        });
      },
      setIsBusy: (value) => {
        set((prev) => {
          return {
            ...prev,
            isBusy: value,
          };
        });
      },
      setErrorMessage: (value) => {
        set((prev) => {
          return {
            ...prev,
            errorMessage: value,
          };
        });
      },
      addCompletedPhase: (phase) => {
        if (get().completedPhases.includes(phase)) {
          return;
        }

        withPersist({
          completedPhases: [...get().completedPhases, phase],
        });
      },
      setCurrentPhase: (phase: number) => {
        withPersist({ currentPhase: phase });
      },
      setCompletedPhases: (phases) => {
        withPersist({ completedPhases: phases });
      },
      setTitle: (value) => {
        withPersist({ title: value });
      },
      setOverview: (value) => {
        withPersist({ overview: value });
      },
      setOverviewMode: (mode) => {
        withPersist({ overviewMode: mode });
      },
      setOverviewFile: (file) => {
        withPersist({ overviewFile: file });
      },
      setWordCount: (value) => {
        withPersist({ wordCount: value });
      },
      setAiMode: (value) => {
        withPersist({ aiMode: value });
      },
      addReference: (file) => {
        withPersist({
          uploadedFiles: [...get().uploadedFiles, file],
        });
      },
      removeReference: (referenceId) => {
        withPersist({
          uploadedFiles: get().uploadedFiles.filter((item) => {
            return item.referenceId !== referenceId;
          }),
        });
      },
      setTone: (value) => {
        withPersist({ tone: value });
      },
      setOutline: (outline) => {
        withPersist({ outline });
      },
      updateOutlineItem: (item) => {
        const nextOutline = get().outline.map((current) => {
          return current.order === item.order ? item : current;
        });
        withPersist({ outline: nextOutline });
      },
      deleteOutlineItem: (order) => {
        const nextOutline = get()
          .outline.filter((item) => {
            return item.order !== order;
          })
          .map((item, index) => {
            return {
              ...item,
              order: index + 1,
            };
          });

        withPersist({ outline: nextOutline });
      },
      addOutlineItem: () => {
        const nextOrder = get().outline.length + 1;
        withPersist({
          outline: [
            ...get().outline,
            {
              order: nextOrder,
              title: `新しい章 ${nextOrder}`,
              summary: '章の概要を入力してください',
            },
          ],
        });
      },
    },
  };
});

export type {
  OutlineItem,
  Tone,
  UploadedReference,
};
