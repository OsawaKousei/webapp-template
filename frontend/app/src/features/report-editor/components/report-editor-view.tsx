import { format } from 'date-fns';
import {
  Home,
  Save,
  Download,
  Search,
  Copy,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type {
  ChatMessage,
  ReferenceItem,
  ReferenceSearchResult,
} from '../api/report-editor-api';

type SaveStatus = 'saved' | 'saving' | 'unsaved';

type ReportEditorViewProps = {
  readonly reportId: string;
  readonly title: string;
  readonly content: string;
  readonly aiMode: string;
  readonly saveStatus: SaveStatus;
  readonly lastSavedAt: Date | null;
  readonly references: readonly ReferenceItem[];
  readonly citations: readonly string[];
  readonly chatMessages: readonly ChatMessage[];
  readonly chatInput: string;
  readonly referenceSearchOpen: boolean;
  readonly referenceSearchQuery: string;
  readonly referenceSearchResults: readonly ReferenceSearchResult[];
  readonly exportOpen: boolean;
  readonly isBusy: boolean;
  readonly errorMessage: string | null;
  readonly onChangeTitle: (value: string) => void;
  readonly onChangeContent: (value: string) => void;
  readonly onChangeAiMode: (value: string) => void;
  readonly onSave: () => void;
  readonly onHome: () => void;
  readonly onOpenExport: () => void;
  readonly onCloseExport: () => void;
  readonly onExport: (format: 'txt' | 'html') => void;
  readonly onChatInput: (value: string) => void;
  readonly onSendChat: () => void;
  readonly onAddReference: () => void;
  readonly onDeleteReference: (referenceId: string) => void;
  readonly onInsertCitations: () => void;
  readonly onCopyCitations: () => void;
  readonly onOpenReferenceSearch: () => void;
  readonly onCloseReferenceSearch: () => void;
  readonly onChangeReferenceSearchQuery: (value: string) => void;
  readonly onSearchReference: () => void;
  readonly onAddReferenceFromSearch: (result: ReferenceSearchResult) => void;
  readonly onInsertIndirectQuote: (result: ReferenceSearchResult) => void;
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

export const ReportEditorView = ({
  reportId,
  title,
  content,
  aiMode,
  saveStatus,
  lastSavedAt,
  references,
  citations,
  chatMessages,
  chatInput,
  referenceSearchOpen,
  referenceSearchQuery,
  referenceSearchResults,
  exportOpen,
  isBusy,
  errorMessage,
  onChangeTitle,
  onChangeContent,
  onChangeAiMode,
  onSave,
  onHome,
  onOpenExport,
  onCloseExport,
  onExport,
  onChatInput,
  onSendChat,
  onAddReference,
  onDeleteReference,
  onInsertCitations,
  onCopyCitations,
  onOpenReferenceSearch,
  onCloseReferenceSearch,
  onChangeReferenceSearchQuery,
  onSearchReference,
  onAddReferenceFromSearch,
  onInsertIndirectQuote,
}: ReportEditorViewProps) => {
  const lastSavedText =
    lastSavedAt === null ? '-' : format(lastSavedAt, 'yyyy-MM-dd HH:mm:ss');

  return (
    <div className="flex h-screen flex-col bg-background">
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
                if (value !== null) {
                  onChangeAiMode(value);
                }
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

            <p className="text-xs text-muted-foreground">
              {content.length} chars
            </p>
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

      {errorMessage === null ? null : (
        <p className="mx-4 mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <div className="flex-1 overflow-hidden p-4">
        <Group orientation="horizontal" className="h-full">
          <Panel defaultSize={66} minSize={30}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle>Report Editor</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-4rem)]">
                <Textarea
                  value={content}
                  onChange={(event) => {
                    onChangeContent(event.currentTarget.value);
                  }}
                  className="h-full min-h-80"
                />
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onOpenReferenceSearch}
                  >
                    <Search className="size-4" />
                    参考文献を探す
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Panel>

          <Separator className="mx-2 w-1 rounded bg-border" />

          <Panel defaultSize={34} minSize={25}>
            <Group orientation="vertical" className="h-full">
              <Panel defaultSize={45} minSize={25}>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MessageSquare className="size-4" />
                      AIチャット
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex h-[calc(100%-4rem)] flex-col gap-2">
                    <div className="flex-1 space-y-2 overflow-auto rounded-md border border-border bg-muted/30 p-2">
                      {chatMessages.map((message, index) => {
                        return (
                          <div
                            key={`${message.role}-${index}`}
                            className="rounded-md bg-card px-2 py-1 text-sm"
                          >
                            <p className="text-xs text-muted-foreground">
                              {message.role}
                            </p>
                            <p>{message.content}</p>
                          </div>
                        );
                      })}
                    </div>
                    <Textarea
                      value={chatInput}
                      onChange={(event) => {
                        onChatInput(event.currentTarget.value);
                      }}
                      className="min-h-20"
                    />
                    <Button
                      type="button"
                      onClick={onSendChat}
                      disabled={isBusy}
                    >
                      送信
                    </Button>
                  </CardContent>
                </Card>
              </Panel>

              <Separator className="my-2 h-1 rounded bg-border" />

              <Panel defaultSize={55} minSize={25}>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">参考文献・引用</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-4rem)]">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onAddReference}
                      >
                        <Plus className="size-4" />
                        追加
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onInsertCitations}
                      >
                        挿入
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onCopyCitations}
                      >
                        <Copy className="size-4" />
                        コピー
                      </Button>
                    </div>

                    <Tabs
                      defaultValue="reference"
                      className="h-[calc(100%-2.5rem)]"
                    >
                      <TabsList>
                        <TabsTrigger value="reference">参考文献</TabsTrigger>
                        <TabsTrigger value="citation">引用</TabsTrigger>
                      </TabsList>

                      <TabsContent
                        value="reference"
                        className="mt-3 space-y-2 overflow-auto"
                      >
                        {references.map((reference) => {
                          return (
                            <div
                              key={reference.referenceId}
                              className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                            >
                              <p className="font-medium">{reference.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {reference.authors ?? '-'} /{' '}
                                {reference.year ?? '-'}
                              </p>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="mt-2"
                                onClick={() => {
                                  onDeleteReference(reference.referenceId);
                                }}
                              >
                                削除
                              </Button>
                            </div>
                          );
                        })}
                      </TabsContent>

                      <TabsContent
                        value="citation"
                        className="mt-3 space-y-2 overflow-auto"
                      >
                        {citations.map((citation, index) => {
                          return (
                            <div
                              key={`${citation}-${index}`}
                              className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                            >
                              {citation}
                            </div>
                          );
                        })}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </Panel>
            </Group>
          </Panel>
        </Group>
      </div>

      <Dialog open={referenceSearchOpen} onOpenChange={onCloseReferenceSearch}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>参考文献検索</DialogTitle>
            <DialogDescription>
              選択テキスト相当の検索語で文献を検索します。
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input
              value={referenceSearchQuery}
              onChange={(event) => {
                onChangeReferenceSearchQuery(event.currentTarget.value);
              }}
              placeholder="検索語を入力"
            />
            <Button type="button" onClick={onSearchReference}>
              検索
            </Button>
          </div>
          <div className="max-h-72 space-y-2 overflow-auto">
            {referenceSearchResults.map((result) => {
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
                        onAddReferenceFromSearch(result);
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
              onClick={onCloseReferenceSearch}
            >
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={exportOpen} onOpenChange={onCloseExport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>エクスポート</DialogTitle>
            <DialogDescription>TXT / HTML 形式で出力します。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Button type="button" variant="outline" disabled>
              PDF（近日登場）
            </Button>
            <Button type="button" variant="outline" disabled>
              Word（近日登場）
            </Button>
            <Button type="button" onClick={() => onExport('txt')}>
              TXT
            </Button>
            <Button type="button" onClick={() => onExport('html')}>
              HTML
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
