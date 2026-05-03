import {
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldCheck,
  Plus,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ReferenceItem } from '../api/report-editor-api';

type ReportEditorSidePanelViewProps = {
  readonly isCollapsed: boolean;
  readonly references: readonly ReferenceItem[];
  readonly citations: readonly string[];
  readonly onToggleCollapse: () => void;
  readonly onOpenReferenceSearch: () => void;
  readonly onRunPlagiarismCheck: () => void;
  readonly onAddReference: () => void;
  readonly onInsertCitations: () => void;
  readonly onCopyCitations: () => void;
  readonly onDeleteReference: (referenceId: string) => void;
};

const collapsedWidthClass = (isCollapsed: boolean) => {
  if (isCollapsed) {
    return 'w-16';
  }

  return 'w-72';
};

export const ReportEditorSidePanelView = ({
  isCollapsed,
  references,
  citations,
  onToggleCollapse,
  onOpenReferenceSearch,
  onRunPlagiarismCheck,
  onAddReference,
  onInsertCitations,
  onCopyCitations,
  onDeleteReference,
}: ReportEditorSidePanelViewProps) => {
  return (
    <div
      className={`flex h-full min-h-0 flex-col gap-3 border-r border-border pr-3 transition-all ${collapsedWidthClass(isCollapsed)}`}
    >
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {isCollapsed ? 'Tools' : 'ツールボックス'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            size={isCollapsed ? 'icon' : 'sm'}
            onClick={onOpenReferenceSearch}
          >
            <Search className="size-4" />
            {isCollapsed ? null : '参考文献を探す'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size={isCollapsed ? 'icon' : 'sm'}
            onClick={onRunPlagiarismCheck}
          >
            <ShieldCheck className="size-4" />
            {isCollapsed ? null : '剽窃チェッカー'}
          </Button>
        </CardContent>
      </Card>

      {isCollapsed ? null : (
        <Card className="min-h-0 flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">参考文献・引用</CardTitle>
          </CardHeader>
          <CardContent className="min-h-0 flex-1">
            <div className="mb-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddReference}
              >
                <Plus className="size-4" />
                追加
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onInsertCitations}
              >
                挿入
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCopyCitations}
              >
                <Copy className="size-4" />
                コピー
              </Button>
            </div>

            <Tabs
              defaultValue="reference"
              className="flex h-full min-h-0 flex-col"
            >
              <TabsList>
                <TabsTrigger value="reference">参考文献</TabsTrigger>
                <TabsTrigger value="citation">引用</TabsTrigger>
              </TabsList>

              <TabsContent
                value="reference"
                className="mt-3 min-h-0 flex-1 space-y-2 overflow-auto"
              >
                {references.map((reference) => {
                  return (
                    <div
                      key={reference.referenceId}
                      className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                    >
                      <p className="font-medium">{reference.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {reference.authors ?? '-'} / {reference.year ?? '-'}
                      </p>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          onDeleteReference(reference.referenceId);
                        }}
                      >
                        削除
                      </Button>
                    </div>
                  );
                })}
              </TabsContent>

              <TabsContent
                value="citation"
                className="mt-3 min-h-0 flex-1 space-y-2 overflow-auto"
              >
                {citations.map((citation, index) => {
                  return (
                    <div
                      key={`${citation}-${index}`}
                      className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                    >
                      {citation}
                    </div>
                  );
                })}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
