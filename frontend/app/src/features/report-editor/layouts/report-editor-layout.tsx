import type { ReactNode } from 'react';

type ReportEditorLayoutProps = {
  readonly sidePanel: ReactNode;
  readonly editor: ReactNode;
  readonly chat: ReactNode;
};

export const ReportEditorLayout = ({
  sidePanel,
  editor,
  chat,
}: ReportEditorLayoutProps) => {
  return (
    <main className="min-h-0 flex-1 overflow-hidden p-4">
      <div className="flex h-full min-h-0 flex-col gap-3 lg:flex-row">
        <aside className="min-h-0 shrink-0">{sidePanel}</aside>
        <section className="min-h-0 min-w-0 flex-1">{editor}</section>
        <section className="min-h-0 min-w-0 flex-1">{chat}</section>
      </div>
    </main>
  );
};
