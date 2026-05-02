import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  deleteReferenceAsync,
  uploadReferenceAsync,
} from '../api/new-report-api';
import { useNewReportStore } from '../stores/use-new-report-store';

export const NewReportStepOverviewWidget = () => {
  const title = useNewReportStore((state) => state.title);
  const overviewMode = useNewReportStore((state) => state.overviewMode);
  const overview = useNewReportStore((state) => state.overview);
  const overviewFile = useNewReportStore((state) => state.overviewFile);
  const wordCount = useNewReportStore((state) => state.wordCount);
  const aiMode = useNewReportStore((state) => state.aiMode);
  const actions = useNewReportStore((state) => state.actions);

  return (
    <div className="space-y-5">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-foreground">タイトル</span>
        <Input
          value={title}
          onChange={(event) => {
            actions.setTitle(event.currentTarget.value);
          }}
          placeholder="レポートタイトルを入力"
        />
      </label>

      <div className="space-y-2 text-sm">
        <span className="font-medium text-foreground">内容</span>

        <label className="mt-1 flex items-center gap-2 text-sm">
          <Checkbox
            checked={overviewMode === 'file'}
            onCheckedChange={(checked) => {
              actions.setOverviewMode(checked ? 'file' : 'text');
            }}
          />
          <span>課題ファイルをアップロードする</span>
        </label>

        {overviewMode === 'text' ? (
          <Textarea
            value={overview}
            onChange={(event) => {
              actions.setOverview(event.currentTarget.value);
            }}
            placeholder="レポート概要を入力してください"
            className="min-h-36"
          />
        ) : (
          <div className="space-y-2">
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(event) => {
                const selectedFile = event.currentTarget.files?.[0];

                if (selectedFile === undefined) {
                  return;
                }

                void (async () => {
                  try {
                    actions.setErrorMessage(null);
                    actions.setIsBusy(true);
                    const uploaded = await uploadReferenceAsync(selectedFile);
                    actions.setOverviewFile(uploaded);
                  } catch (error: unknown) {
                    const message =
                      error instanceof Error
                        ? error.message
                        : 'ファイルアップロードに失敗しました。';
                    actions.setErrorMessage(message);
                  } finally {
                    actions.setIsBusy(false);
                  }
                })();
              }}
            />
            <p className="text-xs text-muted-foreground">
              対応形式: PDF / DOC / DOCX / TXT
            </p>
            {overviewFile === null ? null : (
              <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                <span className="truncate pr-3">{overviewFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    void (async () => {
                      try {
                        await deleteReferenceAsync(overviewFile.referenceId);
                      } catch {
                        // APIが未実装の場合は画面状態のみ更新する。
                      }

                      actions.setOverviewFile(null);
                    })();
                  }}
                >
                  <Trash2 className="size-4" />
                  削除
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-foreground">文字数</span>
          <Select
            value={wordCount}
            onValueChange={(value) => {
              if (value === null) {
                return;
              }

              actions.setWordCount(value);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1000">1000</SelectItem>
              <SelectItem value="1500">1500</SelectItem>
              <SelectItem value="2000">2000</SelectItem>
              <SelectItem value="2500">2500</SelectItem>
            </SelectContent>
          </Select>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-foreground">モデル</span>
          <Select
            value={aiMode}
            onValueChange={(value) => {
              if (value === null) {
                return;
              }

              actions.setAiMode(value);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="speed">Speed</SelectItem>
              <SelectItem value="turbo">Turbo</SelectItem>
            </SelectContent>
          </Select>
        </label>
      </div>
    </div>
  );
};
