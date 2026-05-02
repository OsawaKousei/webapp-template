import { match } from 'ts-pattern';
import { useNewReportStore } from '../stores/use-new-report-store';

export const NewReportStepHumanizeWidget = () => {
  const checkers = useNewReportStore((state) => state.humanizeCheckers);

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
