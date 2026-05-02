import { describe, expect, it } from 'vitest';
import { safeDivideResult } from '../../src/features/demo-playground/utils/safe-math-result';

describe('safeDivideResult', () => {
  it('returns quotient when divisor is valid', () => {
    const result = safeDivideResult({
      dividend: 12,
      divisor: 3,
    });

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBe(4);
  });

  it('returns error when divisor is zero', () => {
    const result = safeDivideResult({
      dividend: 12,
      divisor: 0,
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toBe(
      'Divisor must be greater than 0',
    );
  });
});
