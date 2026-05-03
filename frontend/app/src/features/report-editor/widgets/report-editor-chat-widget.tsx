import type { ChatMessage } from '../api/report-editor-api';
import { ReportEditorChatView } from '../components/report-editor-chat-view';

type ReportEditorChatWidgetProps = {
  readonly chatMessages: readonly ChatMessage[];
  readonly chatInput: string;
  readonly isBusy: boolean;
  readonly onChangeChatInput: (value: string) => void;
  readonly onSendChat: () => void;
};

export const ReportEditorChatWidget = (props: ReportEditorChatWidgetProps) => {
  return <ReportEditorChatView {...props} />;
};
