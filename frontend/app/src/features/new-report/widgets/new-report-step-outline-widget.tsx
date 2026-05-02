import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useNewReportStore } from '../stores/use-new-report-store';

export const NewReportStepOutlineWidget = () => {
  const outline = useNewReportStore((state) => state.outline);
  const actions = useNewReportStore((state) => state.actions);
  const [draggingOrder, setDraggingOrder] = useState<number | null>(null);
  const [dropTargetOrder, setDropTargetOrder] = useState<number | null>(null);

  const moveOutlineItem = (sourceOrder: number, targetOrder: number) => {
    if (sourceOrder === targetOrder) {
      return;
    }

    const sourceItem = outline.find((item) => {
      return item.order === sourceOrder;
    });

    if (sourceItem === undefined) {
      return;
    }

    const nextWithoutSource = outline.filter((item) => {
      return item.order !== sourceOrder;
    });

    const targetIndex = nextWithoutSource.findIndex((item) => {
      return item.order === targetOrder;
    });

    if (targetIndex < 0) {
      return;
    }

    const insertIndex =
      sourceOrder < targetOrder ? targetIndex + 1 : targetIndex;

    const nextOutline = [
      ...nextWithoutSource.slice(0, insertIndex),
      sourceItem,
      ...nextWithoutSource.slice(insertIndex),
    ].map((item, index) => {
      return {
        ...item,
        order: index + 1,
      };
    });

    actions.setOutline(nextOutline);
    setDropTargetOrder(null);
  };

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
      <p className="text-xs text-muted-foreground">
        章のコンテナをドラッグして順序を変更できます。
      </p>
      <Separator />
      <div className="space-y-3">
        {outline.map((item) => {
          const isDropTarget =
            dropTargetOrder === item.order && draggingOrder !== item.order;

          return (
            <Card
              key={item.order}
              draggable
              onDragStart={(event) => {
                const target = event.target;

                if (
                  target instanceof HTMLElement &&
                  target.closest('input,textarea,button') !== null
                ) {
                  event.preventDefault();
                  return;
                }

                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', String(item.order));
                setDraggingOrder(item.order);
              }}
              onDragEnd={() => {
                setDraggingOrder(null);
                setDropTargetOrder(null);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                setDropTargetOrder(item.order);
              }}
              onDragLeave={() => {
                setDropTargetOrder((current) => {
                  return current === item.order ? null : current;
                });
              }}
              onDrop={(event) => {
                event.preventDefault();
                const sourceOrder = Number(
                  event.dataTransfer.getData('text/plain'),
                );

                if (Number.isNaN(sourceOrder)) {
                  return;
                }

                moveOutlineItem(sourceOrder, item.order);
                setDraggingOrder(null);
              }}
              className={cn(
                'cursor-move transition-colors',
                isDropTarget && 'ring-2 ring-primary/40',
              )}
            >
              <CardContent className="space-y-3 py-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    第{item.order}章
                  </p>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={item.order === 1}
                      onClick={() => {
                        moveOutlineItem(item.order, item.order - 1);
                      }}
                      aria-label={`第${item.order}章を上へ移動`}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={item.order === outline.length}
                      onClick={() => {
                        moveOutlineItem(item.order, item.order + 1);
                      }}
                      aria-label={`第${item.order}章を下へ移動`}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                  </div>
                </div>
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
    </div>
  );
};
