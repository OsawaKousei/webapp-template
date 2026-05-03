import { ReportEditorExportDialogView } from '../components/report-editor-export-dialog-view';

type ReportEditorExportDialogWidgetProps = {
  readonly open: boolean;
  readonly onChangeOpen: (nextOpen: boolean) => void;
  readonly onExport: (format: 'txt' | 'html') => void;
};

export const ReportEditorExportDialogWidget = (
  props: ReportEditorExportDialogWidgetProps,
) => {
  return <ReportEditorExportDialogView {...props} />;
};
