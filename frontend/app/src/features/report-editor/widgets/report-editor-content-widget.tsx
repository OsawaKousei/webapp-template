import { ReportEditorContentView } from '../components/report-editor-content-view';

type ReportEditorContentWidgetProps = {
  readonly content: string;
  readonly onChangeContent: (value: string) => void;
};

export const ReportEditorContentWidget = (
  props: ReportEditorContentWidgetProps,
) => {
  return <ReportEditorContentView {...props} />;
};
