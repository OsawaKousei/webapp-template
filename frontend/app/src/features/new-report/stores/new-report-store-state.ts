import type { NewReportStoreData } from './new-report-store-types';

export const initialState: NewReportStoreData = {
  currentPhase: 1,
  completedPhases: [],
  isBusy: false,
  errorMessage: null,
  title: '新規レポート',
  overview: '',
  overviewMode: 'text',
  overviewFile: null,
  wordCount: '1500',
  aiMode: 'speed',
  uploadedFiles: [],
  tone: 'desu-masu',
  outline: [],
};
