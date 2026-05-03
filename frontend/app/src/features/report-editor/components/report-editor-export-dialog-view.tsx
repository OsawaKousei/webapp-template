import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ReportEditorExportDialogViewProps = {
  readonly open: boolean;
  readonly onChangeOpen: (nextOpen: boolean) => void;
  readonly onExport: (format: 'txt' | 'html') => void;
};

export const ReportEditorExportDialogView = ({
  open,
  onChangeOpen,
  onExport,
}: ReportEditorExportDialogViewProps) => {
  return (
    <Dialog open={open} onOpenChange={onChangeOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>エクスポート</DialogTitle>
          <DialogDescription>TXT / HTML 形式で出力します。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Button type="button" variant="outline" disabled>
            PDF（近日登場）
          </Button>
          <Button type="button" variant="outline" disabled>
            Word（近日登場）
          </Button>
          <Button type="button" onClick={() => onExport('txt')}>
            TXT
          </Button>
          <Button type="button" onClick={() => onExport('html')}>
            HTML
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
