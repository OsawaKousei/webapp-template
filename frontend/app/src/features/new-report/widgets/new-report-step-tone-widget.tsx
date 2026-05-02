import { Button } from '@/components/ui/button';
import { useNewReportStore } from '../stores/use-new-report-store';

export const NewReportStepToneWidget = () => {
  const tone = useNewReportStore((state) => state.tone);
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
    </div>
  );
};
