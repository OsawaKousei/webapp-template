import { match } from 'ts-pattern';
import { CalendarClock, Activity, Sigma } from 'lucide-react';
import { Button } from '../../../components/ui/button';

type ValidationState =
  | { readonly status: 'idle' }
  | { readonly status: 'valid'; readonly message: string }
  | { readonly status: 'invalid'; readonly message: string };

type DemoPlaygroundViewProps = {
  readonly counter: number;
  readonly denominatorInput: string;
  readonly divisionText: string;
  readonly validationState: ValidationState;
  readonly lastUpdatedText: string;
  readonly nextSyncText: string;
  readonly onIncrement: () => void;
  readonly onDecrement: () => void;
  readonly onReset: () => void;
  readonly onChangeDenominator: (value: string) => void;
};

const ValidationBadge = ({ state }: { readonly state: ValidationState }) => {
  return match(state)
    .with({ status: 'idle' }, () => {
      return (
        <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
          Enter denominator to update state
        </p>
      );
    })
    .with({ status: 'valid' }, (validState) => {
      return (
        <p className="rounded-md border border-accent bg-accent/20 px-3 py-2 text-sm text-accent-foreground">
          {validState.message}
        </p>
      );
    })
    .with({ status: 'invalid' }, (invalidState) => {
      return (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {invalidState.message}
        </p>
      );
    })
    .exhaustive();
};

export const DemoPlaygroundView = ({
  counter,
  denominatorInput,
  divisionText,
  validationState,
  lastUpdatedText,
  nextSyncText,
  onIncrement,
  onDecrement,
  onReset,
  onChangeDenominator,
}: DemoPlaygroundViewProps) => {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <header className="mb-5 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Library Playground
        </p>
        <h2 className="text-2xl font-semibold text-card-foreground">
          Button and State Demo
        </h2>
      </header>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Button type="button" onClick={onIncrement}>
            <Activity className="size-4" />
            Increment
          </Button>
          <Button type="button" variant="secondary" onClick={onDecrement}>
            <Sigma className="size-4" />
            Decrement
          </Button>
          <Button type="button" variant="outline" onClick={onReset}>
            Reset
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-background/70 p-4">
          <p className="text-sm text-muted-foreground">Counter</p>
          <p className="text-3xl font-semibold text-foreground">{counter}</p>
          <p className="mt-2 text-sm text-muted-foreground">{divisionText}</p>
        </div>

        <label className="flex flex-col gap-2 text-sm text-foreground">
          Denominator (Zod validation)
          <input
            value={denominatorInput}
            onChange={(event) => {
              onChangeDenominator(event.currentTarget.value);
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <ValidationBadge state={validationState} />

        <div className="rounded-xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <CalendarClock className="size-4" />
            Last updated {lastUpdatedText}
          </p>
          <p className="mt-2">Next sync {nextSyncText}</p>
        </div>
      </div>
    </section>
  );
};
