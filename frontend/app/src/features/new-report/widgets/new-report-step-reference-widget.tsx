import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  deleteReferenceAsync,
  uploadReferenceAsync,
} from '../api/new-report-api';
import { useNewReportStore } from '../stores/use-new-report-store';

export const NewReportStepReferenceWidget = () => {
  const uploadedFiles = useNewReportStore((state) => state.uploadedFiles);
  const actions = useNewReportStore((state) => state.actions);

  return (
    <div className="space-y-4">
      <Input
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
        onChange={(event) => {
          const list = event.currentTarget.files;

          if (list === null) {
            return;
          }

          void Array.from(list).reduce(async (previous, file) => {
            await previous;

            try {
              const uploaded = await uploadReferenceAsync(file);
              actions.addReference(uploaded);
            } catch {
              // APIが未実装の場合はこのファイルをスキップする。
            }
          }, Promise.resolve());
        }}
      />

      <div className="space-y-2">
        {uploadedFiles.map((file) => {
          return (
            <div
              key={file.referenceId}
              className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
            >
              <div>
                <p>{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file.size} bytes
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  void (async () => {
                    try {
                      await deleteReferenceAsync(file.referenceId);
                    } catch {
                      // APIが未実装の場合は画面状態のみ更新する。
                    }

                    actions.removeReference(file.referenceId);
                  })();
                }}
              >
                <Trash2 className="size-4" />
                削除
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
