import { z } from 'zod';
import { err, ok, type Result } from 'neverthrow';
import { create } from 'zustand';

const denominatorSchema = z.coerce.number().int().min(1).max(1000);

type ValidationState =
  | { readonly status: 'idle' }
  | { readonly status: 'valid'; readonly message: string }
  | { readonly status: 'invalid'; readonly message: string };

type DemoStore = {
  readonly counter: number;
  readonly denominatorInput: string;
  readonly denominator: number;
  readonly lastUpdatedAt: Date;
  readonly validationState: ValidationState;
  readonly actions: {
    readonly increment: () => void;
    readonly decrement: () => void;
    readonly reset: () => void;
    readonly setDenominatorInput: (value: string) => void;
  };
};

const parseDenominatorResult = (value: string): Result<number, string> => {
  const parseResult = denominatorSchema.safeParse(value);

  if (parseResult.success) {
    return ok(parseResult.data);
  }

  return err('Denominator must be an integer between 1 and 1000');
};

const now = () => new Date();

export const useDemoStore = create<DemoStore>((set) => {
  return {
    counter: 12,
    denominatorInput: '3',
    denominator: 3,
    lastUpdatedAt: now(),
    validationState: { status: 'idle' },
    actions: {
      increment: () => {
        set((state) => {
          return {
            counter: state.counter + 1,
            lastUpdatedAt: now(),
          };
        });
      },
      decrement: () => {
        set((state) => {
          return {
            counter: state.counter - 1,
            lastUpdatedAt: now(),
          };
        });
      },
      reset: () => {
        set(() => {
          return {
            counter: 12,
            denominatorInput: '3',
            denominator: 3,
            validationState: {
              status: 'idle',
            },
            lastUpdatedAt: now(),
          };
        });
      },
      setDenominatorInput: (value: string) => {
        const parseResult = parseDenominatorResult(value);

        if (parseResult.isErr()) {
          set((state) => {
            return {
              denominatorInput: value,
              validationState: {
                status: 'invalid',
                message: parseResult.error,
              },
              lastUpdatedAt: state.lastUpdatedAt,
            };
          });
          return;
        }

        set(() => {
          return {
            denominatorInput: value,
            denominator: parseResult.value,
            validationState: {
              status: 'valid',
              message: `Applied denominator ${parseResult.value}`,
            },
            lastUpdatedAt: now(),
          };
        });
      },
    },
  };
});
