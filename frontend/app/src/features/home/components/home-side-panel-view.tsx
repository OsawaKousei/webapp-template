import { LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SidePanelUser = {
  readonly displayName: string;
  readonly email: string;
  readonly subscriptionPlan: string;
  readonly credits: number;
};

type HomeSidePanelViewProps = {
  readonly user: SidePanelUser;
  readonly onLogout: () => void;
};

export const HomeSidePanelView = ({
  user,
  onLogout,
}: HomeSidePanelViewProps) => {
  return (
    <aside className="flex w-72 flex-col justify-between border-r border-border bg-card px-4 py-5">
      <div className="space-y-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">ユーザー情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium text-foreground">{user.displayName}</p>
            <p className="text-muted-foreground">{user.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">サブスクリプション</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground">プラン</p>
              <Badge variant="secondary">{user.subscriptionPlan}</Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground">利用可能クレジット</p>
              <p className="font-medium text-foreground">{user.credits}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onLogout}
        >
          <LogOut className="size-4" />
          ログアウト
        </Button>
        <p className="text-xs text-muted-foreground">© 2026 Report Suite</p>
      </div>
    </aside>
  );
};
