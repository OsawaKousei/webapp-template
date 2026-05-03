import { format } from 'date-fns';
import { Home, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SaveStatus = 'saved' | 'saving' | 'unsaved';

type ReportEditorHeaderViewProps = {
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

const formatSaveStatus = (status: SaveStatus): string => {
  if (status === 'saving') {
    return 'saving';
  }

  if (status === 'unsaved') {
    return 'unsaved';
  }

  return 'saved';
};

export const ReportEditorHeaderView = ({
  reportId,
  title,
  aiMode,
  contentLength,
  saveStatus,
  lastSavedAt,
  isBusy,
  onChangeTitle,
  onChangeAiMode,
  onHome,
  onSave,
  onOpenExport,
}: ReportEditorHeaderViewProps) => {
  const lastSavedText =
    lastSavedAt === null ? '-' : format(lastSavedAt, 'yyyy-MM-dd HH:mm:ss');

  return (
    <header className="border-b border-border bg-card px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Input
            value={title}
            onChange={(event) => {
              onChangeTitle(event.currentTarget.value);
            }}
            className="max-w-md"
          />
          <p className="text-xs text-muted-foreground">report: {reportId}</p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={aiMode}
            onValueChange={(value) => {
              if (value === null) {
                return;
              }

              onChangeAiMode(value);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="speed">Speed</SelectItem>
              <SelectItem value="turbo">Turbo</SelectItem>
            </SelectContent>
          </Select>

          <p className="text-xs text-muted-foreground">{contentLength} chars</p>
          <p className="text-xs text-muted-foreground">
            {formatSaveStatus(saveStatus)}
          </p>
          <p className="text-xs text-muted-foreground">{lastSavedText}</p>

          <Button type="button" variant="outline" onClick={onHome}>
            <Home className="size-4" />
            Home
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onSave}
            disabled={isBusy}
          >
            <Save className="size-4" />
            保存
          </Button>
          <Button type="button" onClick={onOpenExport}>
            <Download className="size-4" />
            エクスポート
          </Button>
        </div>
      </div>
    </header>
  );
};
