import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type ProjectData = {
  readonly reportId: string;
  readonly title: string;
  readonly lastModifiedAt: string;
};

type ProjectListState =
  | { readonly status: 'loading' }
  | {
      readonly status: 'error';
      readonly message: string;
      readonly onRetry: () => void;
    }
  | { readonly status: 'empty'; readonly hasQuery: boolean }
  | {
      readonly status: 'ready';
      readonly projects: readonly ProjectData[];
      readonly deletingId: string | null;
      readonly onOpenReport: (reportId: string) => void;
      readonly onDeleteClick: (project: ProjectData) => void;
    };

type HomeProjectListViewProps = {
  readonly state: ProjectListState;
  readonly searchQuery: string;
  readonly errorMessage: string | null;
  readonly isCreating: boolean;
  readonly deletingTarget: ProjectData | null;
  readonly isDeleting: boolean;
  readonly onSearchChange: (value: string) => void;
  readonly onCreate: () => void;
  readonly onDeleteCancel: () => void;
  readonly onDeleteConfirm: () => void;
};

const EmptyState = ({ hasQuery }: { readonly hasQuery: boolean }) => {
  return (
    <Card>
      <CardContent className="py-12 text-center text-sm text-muted-foreground">
        {hasQuery
          ? '検索条件に一致するプロジェクトがありません。'
          : 'まだプロジェクトが作成されていません。'}
      </CardContent>
    </Card>
  );
};

export const HomeProjectListView = ({
  state,
  searchQuery,
  errorMessage,
  isCreating,
  deletingTarget,
  isDeleting,
  onSearchChange,
  onCreate,
  onDeleteCancel,
  onDeleteConfirm,
}: HomeProjectListViewProps) => {
  const content = (() => {
    if (state.status === 'loading') {
      return (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            読み込み中...
          </CardContent>
        </Card>
      );
    }

    if (state.status === 'error') {
      return (
        <Card>
          <CardContent className="space-y-4 py-8">
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.message}
            </p>
            <Button type="button" variant="outline" onClick={state.onRetry}>
              再読み込み
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (state.status === 'empty') {
      return <EmptyState hasQuery={state.hasQuery} />;
    }

    return (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {state.projects.map((project) => {
          return (
            <Card key={project.reportId}>
              <CardHeader className="space-y-1">
                <CardTitle className="line-clamp-2 text-base">
                  {project.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  最終更新: {project.lastModifiedAt}
                </p>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    state.onOpenReport(project.reportId);
                  }}
                >
                  <Pencil className="size-4" />
                  編集する
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={state.deletingId === project.reportId}
                  onClick={() => {
                    state.onDeleteClick(project);
                  }}
                >
                  <Trash2 className="size-4" />
                  削除
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>
    );
  })();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-semibold text-foreground">
          プロジェクト一覧
        </h2>
        <Button type="button" onClick={onCreate} disabled={isCreating}>
          <Plus className="size-4" />
          {isCreating ? '作成中...' : '新規作成'}
        </Button>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute top-2 left-2.5 size-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(event) => {
            onSearchChange(event.currentTarget.value);
          }}
          className="pl-8"
          placeholder="プロジェクトを検索..."
        />
      </div>

      {errorMessage === null ? null : (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      {content}

      <Dialog open={deletingTarget !== null} onOpenChange={onDeleteCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>レポートの削除確認</DialogTitle>
            <DialogDescription>
              {deletingTarget?.title}
              <br />
              この操作は取り消すことができません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onDeleteCancel}>
              キャンセル
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={onDeleteConfirm}
            >
              {isDeleting ? '削除中...' : '削除する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
