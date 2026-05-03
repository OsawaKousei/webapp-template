import type { ReferenceSearchResult } from '../api/report-editor-api';
import { ReportEditorReferenceSearchDialogView } from '../components/report-editor-reference-search-dialog-view';

type ReportEditorReferenceSearchDialogWidgetProps = {
  readonly open: boolean;
  readonly query: string;
  readonly results: readonly ReferenceSearchResult[];
  readonly onChangeOpen: (nextOpen: boolean) => void;
  readonly onChangeQuery: (value: string) => void;
  readonly onSearch: () => void;
  readonly onAddReference: (result: ReferenceSearchResult) => void;
  readonly onInsertIndirectQuote: (result: ReferenceSearchResult) => void;
};

export const ReportEditorReferenceSearchDialogWidget = (
  props: ReportEditorReferenceSearchDialogWidgetProps,
) => {
  return <ReportEditorReferenceSearchDialogView {...props} />;
};
