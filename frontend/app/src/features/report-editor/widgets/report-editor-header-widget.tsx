import { ReportEditorHeaderView } from '../components/report-editor-header-view';

type SaveStatus = 'saved' | 'saving' | 'unsaved';

type ReportEditorHeaderWidgetProps = {
  readonly reportId: string;
  readonly title: string;
  readonly aiMode: string;
  readonly contentLength: number;
  readonly saveStatus: SaveStatus;
  readonly lastSavedAt: Date | null;
  readonly isBusy: boolean;
  readonly onChangeTitle: (value: string) => void;
  readonly onChangeAiMode: (value: string) => void;
  readonly onHome: () => void;
  readonly onSave: () => void;
  readonly onOpenExport: () => void;
};

export const ReportEditorHeaderWidget = (
  props: ReportEditorHeaderWidgetProps,
) => {
  return <ReportEditorHeaderView {...props} />;
};
