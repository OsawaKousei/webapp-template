import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type LoginViewProps = {
  readonly email: string;
  readonly onEmailChange: (value: string) => void;
  readonly onLogin: () => void;
};

export const LoginView = ({
  email,
  onEmailChange,
  onLogin,
}: LoginViewProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => {
              onEmailChange(event.currentTarget.value);
            }}
          />
          <Button type="button" className="w-full" onClick={onLogin}>
            ログイン
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
