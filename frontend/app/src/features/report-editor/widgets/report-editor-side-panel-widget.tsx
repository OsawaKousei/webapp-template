import type { ReferenceItem } from '../api/report-editor-api';
import { ReportEditorSidePanelView } from '../components/report-editor-side-panel-view';

type ReportEditorSidePanelWidgetProps = {
  readonly isCollapsed: boolean;
  readonly references: readonly ReferenceItem[];
  readonly citations: readonly string[];
  readonly onToggleCollapse: () => void;
  readonly onOpenReferenceSearch: () => void;
  readonly onRunPlagiarismCheck: () => void;
  readonly onAddReference: () => void;
  readonly onInsertCitations: () => void;
  readonly onCopyCitations: () => void;
  readonly onDeleteReference: (referenceId: string) => void;
};

export const ReportEditorSidePanelWidget = (
  props: ReportEditorSidePanelWidgetProps,
) => {
  return <ReportEditorSidePanelView {...props} />;
};
