import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { ChatMessage } from '../api/report-editor-api';

type ReportEditorChatViewProps = {
  readonly chatMessages: readonly ChatMessage[];
  readonly chatInput: string;
  readonly isBusy: boolean;
  readonly onChangeChatInput: (value: string) => void;
  readonly onSendChat: () => void;
};

export const ReportEditorChatView = ({
  chatMessages,
  chatInput,
  isBusy,
  onChangeChatInput,
  onSendChat,
}: ReportEditorChatViewProps) => {
  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="size-4" />
          AIチャット
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex-1 space-y-2 overflow-auto rounded-md border border-border bg-muted/30 p-2">
          {chatMessages.map((message, index) => {
            return (
              <div
                key={`${message.role}-${index}`}
                className="rounded-md bg-card px-2 py-1 text-sm"
              >
                <p className="text-xs text-muted-foreground">{message.role}</p>
                <p>{message.content}</p>
              </div>
            );
          })}
        </div>
        <Textarea
          value={chatInput}
          onChange={(event) => {
            onChangeChatInput(event.currentTarget.value);
          }}
          className="min-h-24"
        />
        <Button type="button" onClick={onSendChat} disabled={isBusy}>
          送信
        </Button>
      </CardContent>
    </Card>
  );
};
