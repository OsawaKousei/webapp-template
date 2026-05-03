import { Button } from '@/components/ui/button';
import { useNewReportStore } from '../stores/use-new-report-store';

export const NewReportStepToneWidget = () => {
  const tone = useNewReportStore((state) => state.tone);
  const actions = useNewReportStore((state) => state.actions);

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant={tone === 'balanced' ? 'default' : 'outline'}
        className="w-full justify-start"
        onClick={() => {
          actions.setTone('balanced');
        }}
      >
        バランス（標準）
      </Button>
      <Button
        type="button"
        variant={tone === 'formal' ? 'default' : 'outline'}
        className="w-full justify-start"
        onClick={() => {
          actions.setTone('formal');
        }}
      >
        フォーマル
      </Button>
      <Button
        type="button"
        variant={tone === 'casual' ? 'default' : 'outline'}
        className="w-full justify-start"
        onClick={() => {
          actions.setTone('casual');
        }}
      >
        カジュアル
      </Button>
    </div>
  );
};
