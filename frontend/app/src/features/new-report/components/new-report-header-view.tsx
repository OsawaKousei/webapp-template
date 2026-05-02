import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { match } from 'ts-pattern';

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

type NewReportHeaderViewProps = {
  readonly title: string;
  readonly currentPhase: number;
  readonly completedPhases: readonly number[];
  readonly phaseCount: number;
  readonly onCancel: () => void;
};

export const NewReportHeaderView = ({
  title,
  currentPhase,
  completedPhases,
  phaseCount,
  onCancel,
}: NewReportHeaderViewProps) => {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            New Report
          </p>
          <p className="text-sm text-foreground">タイトル: {title}</p>
        </div>
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
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
      </div>
    </header>
  );
};
