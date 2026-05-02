import { beforeEach, describe, expect, it } from 'vitest';
import { useDemoStore } from '../../src/features/demo-playground/stores/use-demo-store';

describe('useDemoStore actions', () => {
  beforeEach(() => {
    useDemoStore.getState().actions.reset();
  });

  it('increments and decrements counter', () => {
    const increment = useDemoStore.getState().actions.increment;
    const decrement = useDemoStore.getState().actions.decrement;

    increment();
    decrement();

    const current = useDemoStore.getState();
    expect(current.counter).toBe(12);
  });

  it('updates denominator and validation state on valid input', () => {
    const setDenominatorInput =
      useDemoStore.getState().actions.setDenominatorInput;

    setDenominatorInput('5');

    const current = useDemoStore.getState();
    expect(current.denominator).toBe(5);
    expect(current.validationState).toEqual({
      status: 'valid',
      message: 'Applied denominator 5',
    });
  });

  it('keeps denominator and sets invalid state on invalid input', () => {
    const setDenominatorInput =
      useDemoStore.getState().actions.setDenominatorInput;

    setDenominatorInput('0');

    const current = useDemoStore.getState();
    expect(current.denominator).toBe(3);
    expect(current.validationState).toEqual({
      status: 'invalid',
      message: 'Denominator must be an integer between 1 and 1000',
    });
  });
});
