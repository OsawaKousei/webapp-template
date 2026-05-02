import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useNewReportStore } from '../stores/use-new-report-store';

export const NewReportStepOutlineWidget = () => {
  const outline = useNewReportStore((state) => state.outline);
  const enableHumanize = useNewReportStore((state) => state.enableHumanize);
  const actions = useNewReportStore((state) => state.actions);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">目次</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={actions.addOutlineItem}
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
                    actions.updateOutlineItem({
                      ...item,
                      title: event.currentTarget.value,
                    });
                  }}
                />
                <Textarea
                  value={item.summary}
                  onChange={(event) => {
                    actions.updateOutlineItem({
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
                    actions.deleteOutlineItem(item.order);
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
            actions.setEnableHumanize(Boolean(checked));
          }}
        />
        <span>人間らしいレポートに調整する</span>
      </div>
    </div>
  );
};
