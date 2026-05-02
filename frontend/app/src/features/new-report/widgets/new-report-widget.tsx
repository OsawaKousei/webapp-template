import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewReportView } from '../components/new-report-view';
import { useNewReportStore } from '../stores/use-new-report-store';
import {
  deleteReferenceAsync,
  generateOutlineAsync,
  generateReportAsync,
  runHumanizeAsync,
  uploadReferenceAsync,
} from '../api/new-report-api';

export const NewReportWidget = () => {
  const navigate = useNavigate();

  const currentPhase = useNewReportStore((state) => state.currentPhase);
  const completedPhases = useNewReportStore((state) => state.completedPhases);
  const title = useNewReportStore((state) => state.title);
  const overview = useNewReportStore((state) => state.overview);
  const overviewMode = useNewReportStore((state) => state.overviewMode);
  const overviewFile = useNewReportStore((state) => state.overviewFile);
  const wordCount = useNewReportStore((state) => state.wordCount);
  const aiMode = useNewReportStore((state) => state.aiMode);
  const uploadedFiles = useNewReportStore((state) => state.uploadedFiles);
  const tone = useNewReportStore((state) => state.tone);
  const outline = useNewReportStore((state) => state.outline);
  const enableHumanize = useNewReportStore((state) => state.enableHumanize);
  const checkers = useNewReportStore((state) => state.humanizeCheckers);
  const actions = useNewReportStore((state) => state.actions);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    actions.initialize();
  }, [actions]);

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

  const markCompleted = (phase: number) => {
    if (completedPhases.includes(phase)) {
      return;
    }

    actions.setCompletedPhases([...completedPhases, phase]);
  };

  const moveToNext = async () => {
    if (!canProceed || isBusy) {
      return;
    }

    setErrorMessage(null);

    if (currentPhase === 3) {
      setIsBusy(true);

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

        actions.setTitle(result.title);
        actions.setOutline(result.outline.items);
      } catch {
        actions.setOutline([
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
        ]);
      } finally {
        setIsBusy(false);
      }
    }

    markCompleted(currentPhase);
    actions.setCurrentPhase(Math.min(currentPhase + 1, phaseCount));
  };

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

  const generate = async () => {
    setErrorMessage(null);
    setIsBusy(true);

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
      setIsBusy(false);
    }
  };

  return (
    <NewReportView
      title={title}
      phaseCount={phaseCount}
      currentPhase={currentPhase}
      completedPhases={completedPhases}
      overviewMode={overviewMode}
      overview={overview}
      overviewFile={overviewFile}
      wordCount={wordCount}
      aiMode={aiMode}
      uploadedFiles={uploadedFiles}
      tone={tone}
      outline={outline}
      enableHumanize={enableHumanize}
      checkers={checkers}
      isBusy={isBusy}
      errorMessage={errorMessage}
      onCancel={() => {
        actions.clear();
        navigate('/home');
      }}
      onBack={() => {
        actions.setCurrentPhase(Math.max(1, currentPhase - 1));
      }}
      onNext={() => {
        void moveToNext();
      }}
      onGenerate={() => {
        void generate();
      }}
      onSetTitle={actions.setTitle}
      onSetOverviewMode={actions.setOverviewMode}
      onSetOverview={actions.setOverview}
      onUploadOverviewFile={(file) => {
        void (async () => {
          try {
            setIsBusy(true);
            const uploaded = await uploadReferenceAsync(file);
            actions.setOverviewFile(uploaded);
          } catch (error: unknown) {
            const message =
              error instanceof Error
                ? error.message
                : 'ファイルアップロードに失敗しました。';
            setErrorMessage(message);
          } finally {
            setIsBusy(false);
          }
        })();
      }}
      onDeleteOverviewFile={() => {
        void (async () => {
          if (overviewFile === null) {
            return;
          }

          try {
            await deleteReferenceAsync(overviewFile.referenceId);
          } catch {
            // APIが未実装の場合は画面状態のみ更新する。
          }

          actions.setOverviewFile(null);
        })();
      }}
      onSetWordCount={actions.setWordCount}
      onSetAiMode={actions.setAiMode}
      onUploadReferenceFiles={(files) => {
        void files.reduce(async (previous, file) => {
          await previous;

          try {
            const uploaded = await uploadReferenceAsync(file);
            actions.addReference(uploaded);
          } catch {
            // APIが未実装の場合はこのファイルをスキップする。
          }
        }, Promise.resolve());
      }}
      onRemoveReference={(referenceId) => {
        void (async () => {
          try {
            await deleteReferenceAsync(referenceId);
          } catch {
            // APIが未実装の場合は画面状態のみ更新する。
          }

          actions.removeReference(referenceId);
        })();
      }}
      onSetTone={actions.setTone}
      onAddOutlineItem={actions.addOutlineItem}
      onUpdateOutlineItem={actions.updateOutlineItem}
      onDeleteOutlineItem={actions.deleteOutlineItem}
      onSetEnableHumanize={actions.setEnableHumanize}
    />
  );
};
