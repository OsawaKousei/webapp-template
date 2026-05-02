import { match } from 'ts-pattern';
import { Button } from '../../../components/ui/button';

type User = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly status: string;
};

type UserProfileViewState =
  | { readonly status: 'loading' }
  | {
      readonly status: 'error';
      readonly message: string;
      readonly onRetry: () => void;
    }
  | {
      readonly status: 'success';
      readonly user: User;
      readonly onRefresh: () => void;
    };

type UserProfileViewProps = {
  readonly state: UserProfileViewState;
};

const UserProfileField = ({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) => {
  return (
    <li className="flex items-center justify-between border-b border-border py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </li>
  );
};

export const UserProfileView = ({ state }: UserProfileViewProps) => {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <header className="mb-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            User Profile
          </p>
          <h2 className="text-2xl font-semibold text-card-foreground">
            Account Snapshot
          </h2>
        </div>
      </header>

      {match(state)
        .with({ status: 'loading' }, () => {
          return (
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
            </div>
          );
        })
        .with({ status: 'error' }, (errorState) => {
          return (
            <div className="space-y-4">
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorState.message}
              </p>
              <Button type="button" onClick={errorState.onRetry}>
                Retry Fetch
              </Button>
            </div>
          );
        })
        .with({ status: 'success' }, (successState) => {
          const fieldList = [
            { label: 'ID', value: successState.user.id },
            { label: 'Name', value: successState.user.name },
            { label: 'Email', value: successState.user.email },
            { label: 'Status', value: successState.user.status },
          ] as const;

          return (
            <div className="space-y-5">
              <ul className="space-y-1">
                {fieldList.map((field) => {
                  return (
                    <UserProfileField
                      key={field.label}
                      label={field.label}
                      value={field.value}
                    />
                  );
                })}
              </ul>
              <Button
                type="button"
                variant="outline"
                onClick={successState.onRefresh}
              >
                Refresh
              </Button>
            </div>
          );
        })
        .exhaustive()}
    </section>
  );
};
