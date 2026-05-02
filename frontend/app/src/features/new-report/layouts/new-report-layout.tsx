import { useEffect, useMemo } from 'react';
import { ArrowLeft, ArrowRight, LoaderCircle } from 'lucide-react';
import { match } from 'ts-pattern';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  generateOutlineAsync,
  generateReportAsync,
  runHumanizeAsync,
} from '../api/new-report-api';
import { useNewReportStore } from '../stores/use-new-report-store';
import { NewReportHeaderWidget } from '../widgets/new-report-header-widget';
import { NewReportStepOutlineWidget } from '../widgets/new-report-step-outline-widget';
import { NewReportStepOverviewWidget } from '../widgets/new-report-step-overview-widget';
import { NewReportStepReferenceWidget } from '../widgets/new-report-step-reference-widget';
import { NewReportStepToneWidget } from '../widgets/new-report-step-tone-widget';

const fallbackOutline = [
  {
    order: 1,
    title: 'はじめに',
    summary: '背景と目的を整理する。',
  },
  {
    order: 2,
    title: '本論',
    summary: '主要な論点を記述する。',
  },
  {
    order: 3,
    title: '結論',
    summary: '考察と今後の課題をまとめる。',
  },
] as const;

const phaseLabel = (phase: number) => {
  return match(phase)
    .with(1, () => '概要')
    .with(2, () => '参考資料')
    .with(3, () => '口調')
    .with(4, () => '目次')
    .with(5, () => 'Humanize')
    .otherwise(() => '未定義');
};

export const NewReportLayout = () => {
  const navigate = useNavigate();

  const currentPhase = useNewReportStore((state) => state.currentPhase);
  const overviewMode = useNewReportStore((state) => state.overviewMode);
  const overview = useNewReportStore((state) => state.overview);
  const overviewFile = useNewReportStore((state) => state.overviewFile);
  const wordCount = useNewReportStore((state) => state.wordCount);
  const aiMode = useNewReportStore((state) => state.aiMode);
  const title = useNewReportStore((state) => state.title);
  const outline = useNewReportStore((state) => state.outline);
  const tone = useNewReportStore((state) => state.tone);
  const uploadedFiles = useNewReportStore((state) => state.uploadedFiles);
  const enableHumanize = useNewReportStore((state) => state.enableHumanize);
  const checkers = useNewReportStore((state) => state.humanizeCheckers);
  const isBusy = useNewReportStore((state) => state.isBusy);
  const errorMessage = useNewReportStore((state) => state.errorMessage);
  const actions = useNewReportStore((state) => state.actions);

  const currentStep = match(currentPhase)
    .with(1, () => <NewReportStepOverviewWidget />)
    .with(2, () => <NewReportStepReferenceWidget />)
    .with(3, () => <NewReportStepToneWidget />)
    .with(4, () => <NewReportStepOutlineWidget />)
    .otherwise(() => null);

  const phaseCount = enableHumanize ? 5 : 4;

  const canProceed = useMemo(() => {
    if (currentPhase === 1) {
      if (overviewMode === 'text') {
        return overview.trim().length > 0;
      }

      return overviewFile !== null;
    }

    if (currentPhase === 2) {
      return true;
    }

    if (currentPhase === 3) {
      return tone.length > 0;
    }

    if (currentPhase === 4) {
      return outline.length > 0;
    }

    return true;
  }, [
    currentPhase,
    overviewMode,
    overview,
    overviewFile,
    tone,
    outline.length,
  ]);

  const runHumanizeSequenceAsync = async (targetReportId: string) => {
    await checkers.reduce(async (previous, checker) => {
      await previous;
      actions.setCheckerStatus(checker.key, 'checking');

      try {
        await runHumanizeAsync(targetReportId, checker.key);
        actions.setCheckerStatus(checker.key, 'success');
      } catch {
        actions.setCheckerStatus(checker.key, 'fail');
      }
    }, Promise.resolve());
  };

  const moveToNextAsync = async () => {
    if (!canProceed || isBusy) {
      return;
    }

    actions.setErrorMessage(null);

    if (currentPhase === 3) {
      actions.setIsBusy(true);

      try {
        const result = await generateOutlineAsync({
          overview,
          wordCount,
          aiMode,
          reference_ids: uploadedFiles.map((file) => {
            return file.referenceId;
          }),
          overview_reference_id: overviewFile?.referenceId ?? null,
        });

        actions.setOutline(result.outline.items);
      } catch {
        actions.setOutline(fallbackOutline);
      } finally {
        actions.setIsBusy(false);
      }
    }

    actions.addCompletedPhase(currentPhase);
    actions.setCurrentPhase(Math.min(currentPhase + 1, phaseCount));
  };

  const generateAsync = async () => {
    actions.setErrorMessage(null);
    actions.setIsBusy(true);

    try {
      const generatedReport = await generateReportAsync({
        overview,
        title,
        outline,
        wordCount,
        aiMode,
        tone,
        reference: uploadedFiles.map((item) => {
          return item.referenceId;
        }),
        humanize: enableHumanize,
      });

      if (!enableHumanize) {
        actions.clear();
        navigate(`/report/${generatedReport.reportId}`);
        return;
      }

      actions.setCurrentPhase(5);
      actions.resetCheckers();
      await runHumanizeSequenceAsync(generatedReport.reportId);

      setTimeout(() => {
        actions.clear();
        navigate(`/report/${generatedReport.reportId}`);
      }, 2000);
    } catch {
      actions.clear();
      navigate('/home');
    } finally {
      actions.setIsBusy(false);
    }
  };

  useEffect(() => {
    actions.initialize();
  }, [actions]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <main className="min-h-0 min-w-0 flex-1 overflow-auto p-4 md:p-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <NewReportHeaderWidget />

          {errorMessage === null ? null : (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          )}

          <section className="min-h-0">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{phaseLabel(currentPhase)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentStep}
                <footer className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={currentPhase === 1 || currentPhase === 5}
                    onClick={() => {
                      actions.setCurrentPhase(Math.max(1, currentPhase - 1));
                    }}
                  >
                    <ArrowLeft className="size-4" />
                    前へ
                  </Button>

                  {currentPhase === 4 ? (
                    <Button
                      type="button"
                      onClick={() => {
                        void generateAsync();
                      }}
                      disabled={isBusy}
                    >
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
                    <Button
                      type="button"
                      onClick={() => {
                        void moveToNextAsync();
                      }}
                      disabled={isBusy}
                    >
                      {currentPhase === 3 ? 'AIで目次を作成' : '次へ'}
                      <ArrowRight className="size-4" />
                    </Button>
                  )}
                </footer>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};
