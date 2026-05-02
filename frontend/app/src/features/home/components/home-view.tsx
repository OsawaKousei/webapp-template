import { Search, LogOut, Trash2, Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type UserData = {
  readonly displayName: string;
  readonly email: string;
  readonly subscriptionPlan: string;
  readonly credits: number;
};

type ProjectData = {
  readonly reportId: string;
  readonly title: string;
  readonly lastModifiedAt: string;
};

type HomeViewProps = {
  readonly user: UserData;
  readonly projects: readonly ProjectData[];
  readonly searchQuery: string;
  readonly errorMessage: string | null;
  readonly isLoading: boolean;
  readonly isCreating: boolean;
  readonly deletingId: string | null;
  readonly deletingTarget: ProjectData | null;
  readonly onSearchChange: (value: string) => void;
  readonly onCreate: () => void;
  readonly onOpenReport: (reportId: string) => void;
  readonly onDeleteClick: (project: ProjectData) => void;
  readonly onDeleteCancel: () => void;
  readonly onDeleteConfirm: () => void;
  readonly onLogout: () => void;
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

export const HomeView = ({
  user,
  projects,
  searchQuery,
  errorMessage,
  isLoading,
  isCreating,
  deletingId,
  deletingTarget,
  onSearchChange,
  onCreate,
  onOpenReport,
  onDeleteClick,
  onDeleteCancel,
  onDeleteConfirm,
  onLogout,
}: HomeViewProps) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="flex w-64 flex-col justify-between border-r border-border bg-card p-4">
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Report Suite
            </p>
            <h1 className="text-lg font-semibold text-card-foreground">Home</h1>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">ユーザー情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-foreground">{user.displayName}</p>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge variant="secondary">{user.subscriptionPlan}</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">利用状況</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>利用可能クレジット: {user.credits}</p>
              <p className="text-muted-foreground">
                ベータ期間中は無制限で利用できます
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onLogout}
          >
            <LogOut className="size-4" />
            ログアウト
          </Button>
          <p className="text-xs text-muted-foreground">© 2026 Report Suite</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">
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

          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                読み込み中...
              </CardContent>
            </Card>
          ) : projects.length === 0 ? (
            <EmptyState hasQuery={searchQuery.trim().length > 0} />
          ) : (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
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
                          onOpenReport(project.reportId);
                        }}
                      >
                        <Pencil className="size-4" />
                        編集する
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={deletingId === project.reportId}
                        onClick={() => {
                          onDeleteClick(project);
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
          )}
        </div>
      </main>

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
              disabled={deletingId !== null}
              onClick={onDeleteConfirm}
            >
              {deletingId === null ? '削除する' : '削除中...'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
