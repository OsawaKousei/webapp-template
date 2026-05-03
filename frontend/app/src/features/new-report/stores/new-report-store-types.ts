export type OverviewMode = 'text' | 'file';
export type Tone = 'formal' | 'balanced' | 'casual';

export type UploadedReference = {
  readonly referenceId: string;
  readonly name: string;
  readonly size: number;
};

export type OutlineItem = {
  readonly order: number;
  readonly title: string;
  readonly summary: string;
};

export type NewReportActions = {
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

export type NewReportStoreData = {
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
};

export type NewReportState = NewReportStoreData & {
  readonly actions: NewReportActions;
};

export type HydratedState = {
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
