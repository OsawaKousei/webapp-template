import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ReferenceSearchResult } from '../api/report-editor-api';

type ReportEditorReferenceSearchDialogViewProps = {
  readonly open: boolean;
  readonly query: string;
  readonly results: readonly ReferenceSearchResult[];
  readonly onChangeOpen: (nextOpen: boolean) => void;
  readonly onChangeQuery: (value: string) => void;
  readonly onSearch: () => void;
  readonly onAddReference: (result: ReferenceSearchResult) => void;
  readonly onInsertIndirectQuote: (result: ReferenceSearchResult) => void;
};

export const ReportEditorReferenceSearchDialogView = ({
  open,
  query,
  results,
  onChangeOpen,
  onChangeQuery,
  onSearch,
  onAddReference,
  onInsertIndirectQuote,
}: ReportEditorReferenceSearchDialogViewProps) => {
  return (
    <Dialog open={open} onOpenChange={onChangeOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>参考文献検索</DialogTitle>
          <DialogDescription>
            選択テキスト相当の検索語で文献を検索します。
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(event) => {
              onChangeQuery(event.currentTarget.value);
            }}
            placeholder="検索語を入力"
          />
          <Button type="button" onClick={onSearch}>
            検索
          </Button>
        </div>

        <div className="max-h-72 space-y-2 overflow-auto">
          {results.map((result) => {
            return (
              <div
                key={result.id}
                className="rounded-md border border-border bg-card p-3 text-sm"
              >
                <p className="font-medium">{result.title}</p>
                <p className="text-xs text-muted-foreground">
                  {result.authors ?? '-'} / {result.year ?? '-'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {result.abstract ?? '-'}
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onAddReference(result);
                    }}
                  >
                    追加
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      onInsertIndirectQuote(result);
                    }}
                  >
                    間接引用を挿入
                  </Button>
                  <Button type="button" size="sm" variant="outline" disabled>
                    直接引用（対応予定）
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onChangeOpen(false)}
          >
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
