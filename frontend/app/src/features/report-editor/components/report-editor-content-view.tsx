import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

type ReportEditorContentViewProps = {
  readonly content: string;
  readonly onChangeContent: (value: string) => void;
};

export const ReportEditorContentView = ({
  content,
  onChangeContent,
}: ReportEditorContentViewProps) => {
  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Report Editor</CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        <Textarea
          value={content}
          onChange={(event) => {
            onChangeContent(event.currentTarget.value);
          }}
          className="h-full min-h-0"
        />
      </CardContent>
    </Card>
  );
};
