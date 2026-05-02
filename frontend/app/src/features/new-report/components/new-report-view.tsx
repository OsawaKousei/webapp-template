import { match } from 'ts-pattern';
import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  Plus,
  Trash2,
} from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type {
  HumanizeCheckerState,
  OutlineItem,
  Tone,
  UploadedReference,
} from '../stores/use-new-report-store';

type NewReportViewProps = {
  readonly reportId: string;
  readonly title: string;
  readonly phaseCount: number;
  readonly currentPhase: number;
  readonly completedPhases: readonly number[];
  readonly overviewMode: 'text' | 'file';
  readonly overview: string;
  readonly overviewFile: UploadedReference | null;
  readonly wordCount: string;
  readonly aiMode: string;
  readonly uploadedFiles: readonly UploadedReference[];
  readonly tone: Tone;
  readonly outline: readonly OutlineItem[];
  readonly enableHumanize: boolean;
  readonly checkers: readonly HumanizeCheckerState[];
  readonly isBusy: boolean;
  readonly errorMessage: string | null;
  readonly onCancel: () => void;
  readonly onBack: () => void;
  readonly onNext: () => void;
  readonly onGenerate: () => void;
  readonly onSetTitle: (value: string) => void;
  readonly onSetOverviewMode: (mode: 'text' | 'file') => void;
  readonly onSetOverview: (value: string) => void;
  readonly onUploadOverviewFile: (file: File) => void;
  readonly onDeleteOverviewFile: () => void;
  readonly onSetWordCount: (value: string) => void;
  readonly onSetAiMode: (value: string) => void;
  readonly onUploadReferenceFiles: (files: readonly File[]) => void;
  readonly onRemoveReference: (referenceId: string) => void;
  readonly onSetTone: (tone: Tone) => void;
  readonly onAddOutlineItem: () => void;
  readonly onUpdateOutlineItem: (item: OutlineItem) => void;
  readonly onDeleteOutlineItem: (order: number) => void;
  readonly onSetEnableHumanize: (value: boolean) => void;
};

const phaseLabel = (phase: number) => {
  return match(phase)
    .with(1, () => '概要')
    .with(2, () => '参考資料')
    .with(3, () => '口調')
    .with(4, () => '目次')
    .with(5, () => 'Humanize')
    .otherwise(() => '未定義');
};

const PhaseBadge = ({
  phase,
  currentPhase,
  completedPhases,
}: {
  readonly phase: number;
  readonly currentPhase: number;
  readonly completedPhases: readonly number[];
}) => {
  const isCurrent = phase === currentPhase;
  const isCompleted = completedPhases.includes(phase);

  if (isCurrent) {
    return <Badge>{`${phase}. ${phaseLabel(phase)}`}</Badge>;
  }

  if (isCompleted) {
    return (
      <Badge variant="secondary">{`${phase}. ${phaseLabel(phase)}`}</Badge>
    );
  }

  return <Badge variant="outline">{`${phase}. ${phaseLabel(phase)}`}</Badge>;
};

const HumanizeList = ({
  checkers,
}: {
  readonly checkers: readonly HumanizeCheckerState[];
}) => {
  return (
    <div className="space-y-2">
      {checkers.map((checker) => {
        const statusLabel = match(checker.status)
          .with('idle', () => '待機中')
          .with('checking', () => 'チェック中...')
          .with('success', () => '完了')
          .with('fail', () => '失敗')
          .exhaustive();

        return (
          <div
            key={checker.key}
            className="flex items-center justify-between rounded-md border border-border bg-card p-3 text-sm"
          >
            <span>{checker.label}</span>
            <span className="text-muted-foreground">{statusLabel}</span>
          </div>
        );
      })}
    </div>
  );
};

export const NewReportView = ({
  reportId,
  title,
  phaseCount,
  currentPhase,
  completedPhases,
  overviewMode,
  overview,
  overviewFile,
  wordCount,
  aiMode,
  uploadedFiles,
  tone,
  outline,
  enableHumanize,
  checkers,
  isBusy,
  errorMessage,
  onCancel,
  onBack,
  onNext,
  onGenerate,
  onSetTitle,
  onSetOverviewMode,
  onSetOverview,
  onUploadOverviewFile,
  onDeleteOverviewFile,
  onSetWordCount,
  onSetAiMode,
  onUploadReferenceFiles,
  onRemoveReference,
  onSetTone,
  onAddOutlineItem,
  onUpdateOutlineItem,
  onDeleteOutlineItem,
  onSetEnableHumanize,
}: NewReportViewProps) => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              New Report / {reportId}
            </p>
            <Input
              value={title}
              onChange={(event) => {
                onSetTitle(event.currentTarget.value);
              }}
              className="h-9 max-w-md"
            />
          </div>
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
        </header>

        <Card>
          <CardContent className="flex flex-wrap gap-2 py-4">
            {Array.from({ length: phaseCount }, (_, index) => {
              const phase = index + 1;
              return (
                <PhaseBadge
                  key={phase}
                  phase={phase}
                  currentPhase={currentPhase}
                  completedPhases={completedPhases}
                />
              );
            })}
          </CardContent>
        </Card>

        {errorMessage === null ? null : (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{phaseLabel(currentPhase)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {match(currentPhase)
              .with(1, () => {
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={overviewMode === 'file'}
                        onCheckedChange={(checked) => {
                          onSetOverviewMode(checked ? 'file' : 'text');
                        }}
                      />
                      <span>課題ファイルをアップロードする</span>
                    </div>

                    {overviewMode === 'text' ? (
                      <Textarea
                        value={overview}
                        onChange={(event) => {
                          onSetOverview(event.currentTarget.value);
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

                            onUploadOverviewFile(selectedFile);
                          }}
                        />
                        {overviewFile === null ? null : (
                          <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                            <span>{overviewFile.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={onDeleteOverviewFile}
                            >
                              <Trash2 className="size-4" />
                              削除
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2 text-sm">
                        文字数
                        <Select
                          value={wordCount}
                          onValueChange={(value) => {
                            if (value !== null) {
                              onSetWordCount(value);
                            }
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

                      <label className="space-y-2 text-sm">
                        モデル
                        <Select
                          value={aiMode}
                          onValueChange={(value) => {
                            if (value !== null) {
                              onSetAiMode(value);
                            }
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
              })
              .with(2, () => {
                return (
                  <div className="space-y-4">
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                      onChange={(event) => {
                        const list = event.currentTarget.files;

                        if (list === null) {
                          return;
                        }

                        onUploadReferenceFiles(Array.from(list));
                      }}
                    />

                    <div className="space-y-2">
                      {uploadedFiles.map((file) => {
                        return (
                          <div
                            key={file.referenceId}
                            className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
                          >
                            <div>
                              <p>{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {file.size} bytes
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                onRemoveReference(file.referenceId);
                              }}
                            >
                              <Trash2 className="size-4" />
                              削除
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
              .with(3, () => {
                return (
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant={tone === 'desu-masu' ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => {
                        onSetTone('desu-masu');
                      }}
                    >
                      です・ます調
                    </Button>
                    <Button
                      type="button"
                      variant={tone === 'dearu-da' ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => {
                        onSetTone('dearu-da');
                      }}
                    >
                      である・だ調
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                      disabled
                    >
                      ユーザーの口調に合わせる（近日登場）
                    </Button>
                  </div>
                );
              })
              .with(4, () => {
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">目次</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onAddOutlineItem}
                      >
                        <Plus className="size-4" />
                        章を追加
                      </Button>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      {outline.map((item) => {
                        return (
                          <Card key={item.order}>
                            <CardContent className="space-y-3 py-4">
                              <p className="text-xs text-muted-foreground">
                                第{item.order}章
                              </p>
                              <Input
                                value={item.title}
                                onChange={(event) => {
                                  onUpdateOutlineItem({
                                    ...item,
                                    title: event.currentTarget.value,
                                  });
                                }}
                              />
                              <Textarea
                                value={item.summary}
                                onChange={(event) => {
                                  onUpdateOutlineItem({
                                    ...item,
                                    summary: event.currentTarget.value,
                                  });
                                }}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  onDeleteOutlineItem(item.order);
                                }}
                              >
                                <Trash2 className="size-4" />
                                削除
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={enableHumanize}
                        onCheckedChange={(checked) => {
                          onSetEnableHumanize(Boolean(checked));
                        }}
                      />
                      <span>人間らしいレポートに調整する</span>
                    </div>
                  </div>
                );
              })
              .with(5, () => {
                return <HumanizeList checkers={checkers} />;
              })
              .otherwise(() => {
                return null;
              })}
          </CardContent>
        </Card>

        <footer className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={currentPhase === 1 || currentPhase === 5}
            onClick={onBack}
          >
            <ArrowLeft className="size-4" />
            前へ
          </Button>

          {currentPhase === 4 ? (
            <Button type="button" onClick={onGenerate} disabled={isBusy}>
              {isBusy ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              AIでレポートを生成
            </Button>
          ) : currentPhase === 5 ? (
            <Button type="button" disabled>
              <LoaderCircle className="size-4 animate-spin" />
              Humanize実行中
            </Button>
          ) : (
            <Button type="button" onClick={onNext} disabled={isBusy}>
              {currentPhase === 3 ? 'AIで目次を作成' : '次へ'}
              <ArrowRight className="size-4" />
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
};
