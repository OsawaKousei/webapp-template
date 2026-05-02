import { err, ok, type Result } from 'neverthrow';

type DivideArgs = {
  readonly dividend: number;
  readonly divisor: number;
};

export const safeDivideResult = ({
  dividend,
  divisor,
}: DivideArgs): Result<number, Error> => {
  if (divisor === 0) {
    return err(new Error('Divisor must be greater than 0'));
  }

  return ok(dividend / divisor);
};
