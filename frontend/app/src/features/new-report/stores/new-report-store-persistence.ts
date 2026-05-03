import type {
  HydratedState,
  NewReportStoreData,
  OutlineItem,
  OverviewMode,
  Tone,
  UploadedReference,
} from './new-report-store-types';

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

const safeSessionStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage;
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
  return value === 'formal' || value === 'balanced' || value === 'casual';
};

const normalizeStoredTone = (value: string): Tone | null => {
  if (isTone(value)) {
    return value;
  }

  if (value === 'dearu-da') {
    return 'formal';
  }

  if (value === 'desu-masu') {
    return 'balanced';
  }

  return null;
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

export const persistState = (state: NewReportStoreData) => {
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

export const clearPersistedState = () => {
  const storage = safeSessionStorage();

  if (storage === null) {
    return;
  }

  PERSIST_KEYS.forEach((key) => {
    storage.removeItem(key);
  });
};

export const hydrateState = (): HydratedState => {
  const storage = safeSessionStorage();

  if (storage === null) {
    return {};
  }

  const next: HydratedState = {};
  const storedPhase = parseNumber(storage.getItem(KEY.currentPhase));

  if (storedPhase !== null && storedPhase >= 1 && storedPhase <= 4) {
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

  if (storedTone !== null) {
    const normalizedTone = normalizeStoredTone(storedTone);

    if (normalizedTone !== null) {
      next.tone = normalizedTone;
    }
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
