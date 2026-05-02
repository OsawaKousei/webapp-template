import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useNewReportStore } from '../stores/use-new-report-store';

export const NewReportStepToneWidget = () => {
  const tone = useNewReportStore((state) => state.tone);
  const enableHumanize = useNewReportStore((state) => state.enableHumanize);
  const actions = useNewReportStore((state) => state.actions);

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant={tone === 'desu-masu' ? 'default' : 'outline'}
        className="w-full justify-start"
        onClick={() => {
          actions.setTone('desu-masu');
        }}
      >
        です・ます調
      </Button>
      <Button
        type="button"
        variant={tone === 'dearu-da' ? 'default' : 'outline'}
        className="w-full justify-start"
        onClick={() => {
          actions.setTone('dearu-da');
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

      <div className="space-y-2 pt-1 text-sm">
        <span className="font-medium text-foreground">ヒューマナイズ</span>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={enableHumanize}
            onCheckedChange={(checked) => {
              actions.setEnableHumanize(Boolean(checked));
            }}
          />
          <span>人間らしいレポートに調整する</span>
        </label>
      </div>
    </div>
  );
};
