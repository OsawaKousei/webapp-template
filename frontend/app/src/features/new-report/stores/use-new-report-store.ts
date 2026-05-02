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

type HumanizeCheckerState = {
  readonly key: string;
  readonly label: string;
  readonly status: 'idle' | 'checking' | 'success' | 'fail';
};

type NewReportState = {
  readonly reportId: string;
  readonly currentPhase: number;
  readonly completedPhases: readonly number[];
  readonly title: string;
  readonly overview: string;
  readonly overviewMode: OverviewMode;
  readonly overviewFile: UploadedReference | null;
  readonly wordCount: string;
  readonly aiMode: string;
  readonly uploadedFiles: readonly UploadedReference[];
  readonly tone: Tone;
  readonly outline: readonly OutlineItem[];
  readonly enableHumanize: boolean;
  readonly humanizeCheckers: readonly HumanizeCheckerState[];
  readonly actions: {
    readonly initialize: (reportId: string) => void;
    readonly clear: () => void;
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
    readonly setEnableHumanize: (value: boolean) => void;
    readonly setCheckerStatus: (
      checkerKey: string,
      status: HumanizeCheckerState['status'],
    ) => void;
    readonly resetCheckers: () => void;
  };
};

const KEY = {
  currentPhase: 'report_current_phase',
  completedPhases: 'report_completed_phases',
  overview: 'report_text_overview',
  wordCount: 'report_word_count',
  aiMode: 'report_model',
  overviewMode: 'report_is_file_upload',
  uploadedFileName: 'report_uploaded_file_name',
  uploadedFileSize: 'report_uploaded_file_size',
  title: 'report_title',
  references: 'reference_uploaded_files',
  tone: 'tone_selection',
  outline: 'outline_items',
  enableHumanize: 'enable_humanize',
} as const;

const createInitialCheckers = (): readonly HumanizeCheckerState[] => {
  return [
    { key: 'naturalness', label: '自然な文体チェック', status: 'idle' },
    { key: 'coherence', label: '整合性チェック', status: 'idle' },
    { key: 'readability', label: '可読性チェック', status: 'idle' },
  ];
};

const initialState = {
  reportId: '',
  currentPhase: 1,
  completedPhases: [] as readonly number[],
  title: '新規レポート',
  overview: '',
  overviewMode: 'text' as const,
  overviewFile: null,
  wordCount: '1500',
  aiMode: 'speed',
  uploadedFiles: [] as readonly UploadedReference[],
  tone: 'desu-masu' as const,
  outline: [] as readonly OutlineItem[],
  enableHumanize: false,
  humanizeCheckers: createInitialCheckers(),
};

const safeSessionStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage;
};

const toNumber = (value: string | null, fallback: number): number => {
  if (value === null) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseJson = <T>(value: string | null, fallback: T): T => {
  if (value === null) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
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
  storage.setItem(KEY.title, state.title);
  storage.setItem(KEY.references, JSON.stringify(state.uploadedFiles));
  storage.setItem(KEY.tone, state.tone);
  storage.setItem(KEY.outline, JSON.stringify(state.outline));
  storage.setItem(KEY.enableHumanize, JSON.stringify(state.enableHumanize));

  if (state.overviewFile === null) {
    storage.removeItem(KEY.uploadedFileName);
    storage.removeItem(KEY.uploadedFileSize);
    return;
  }

  storage.setItem(KEY.uploadedFileName, state.overviewFile.name);
  storage.setItem(KEY.uploadedFileSize, String(state.overviewFile.size));
};

const hydrateState = (reportId: string) => {
  const storage = safeSessionStorage();

  if (storage === null) {
    return {
      ...initialState,
      reportId,
    };
  }

  const overviewMode: OverviewMode =
    storage.getItem(KEY.overviewMode) === 'true' ? 'file' : 'text';
  const uploadedFileName = storage.getItem(KEY.uploadedFileName);
  const uploadedFileSize = toNumber(storage.getItem(KEY.uploadedFileSize), 0);
  const overviewFile =
    uploadedFileName === null
      ? null
      : {
        referenceId: `overview-${reportId}`,
        name: uploadedFileName,
        size: uploadedFileSize,
      };

  return {
    ...initialState,
    reportId,
    currentPhase: toNumber(storage.getItem(KEY.currentPhase), 1),
    completedPhases: parseJson<readonly number[]>(
      storage.getItem(KEY.completedPhases),
      [],
    ),
    overview: storage.getItem(KEY.overview) ?? '',
    wordCount: storage.getItem(KEY.wordCount) ?? '1500',
    aiMode: storage.getItem(KEY.aiMode) ?? 'speed',
    overviewMode,
    title: storage.getItem(KEY.title) ?? '新規レポート',
    uploadedFiles: parseJson<readonly UploadedReference[]>(
      storage.getItem(KEY.references),
      [],
    ),
    tone: (storage.getItem(KEY.tone) ?? 'desu-masu') as Tone,
    outline: parseJson<readonly OutlineItem[]>(storage.getItem(KEY.outline), []),
    enableHumanize: parseJson<boolean>(
      storage.getItem(KEY.enableHumanize),
      false,
    ),
    overviewFile,
  };
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
      initialize: (reportId: string) => {
        set((state) => {
          const next = {
            ...state,
            ...hydrateState(reportId),
          };
          persistState(next);
          return next;
        });
      },
      clear: () => {
        set(() => {
          const storage = safeSessionStorage();
          storage?.clear();
          return {
            ...initialState,
            actions: get().actions,
          };
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
      setEnableHumanize: (value) => {
        withPersist({ enableHumanize: value });
      },
      setCheckerStatus: (checkerKey, status) => {
        set((prev) => {
          return {
            ...prev,
            humanizeCheckers: prev.humanizeCheckers.map((checker) => {
              return checker.key === checkerKey
                ? {
                  ...checker,
                  status,
                }
                : checker;
            }),
          };
        });
      },
      resetCheckers: () => {
        set((prev) => {
          return {
            ...prev,
            humanizeCheckers: createInitialCheckers(),
          };
        });
      },
    },
  };
});

export type {
  HumanizeCheckerState,
  OutlineItem,
  Tone,
  UploadedReference,
};
