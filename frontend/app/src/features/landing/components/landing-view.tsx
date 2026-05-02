import { Button } from '@/components/ui/button';

type LandingViewProps = {
  readonly onStart: () => void;
};

export const LandingView = ({ onStart }: LandingViewProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl space-y-6 rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Report Suite
        </p>
        <h1 className="text-4xl font-semibold text-card-foreground">
          AIレポート作成を、
          <br />
          もっと速く、もっと自然に。
        </h1>
        <p className="text-sm text-muted-foreground">
          Home / New Report / Report Editor
          の一連フローをこのデモで体験できます。
        </p>
        <Button type="button" size="lg" onClick={onStart}>
          ログインへ進む
        </Button>
      </div>
    </div>
  );
};
