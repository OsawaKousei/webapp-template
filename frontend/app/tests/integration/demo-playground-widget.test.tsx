import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DemoPlaygroundWidget } from '../../src/features/demo-playground';
import { useDemoStore } from '../../src/features/demo-playground/stores/use-demo-store';

describe('DemoPlaygroundWidget', () => {
  beforeEach(() => {
    useDemoStore.getState().actions.reset();
  });

  it('updates counter and division text when incrementing', async () => {
    const user = userEvent.setup();

    render(<DemoPlaygroundWidget />);

    expect(screen.getByText('Counter')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('Result: 12 / 3 = 4.00')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Increment' }));

    expect(screen.getByText('13')).toBeTruthy();
    expect(screen.getByText('Result: 13 / 3 = 4.33')).toBeTruthy();
  });

  it('shows invalid state and then recovers with valid denominator', async () => {
    const user = userEvent.setup();

    render(<DemoPlaygroundWidget />);

    const denominatorInput = screen.getByLabelText(
      'Denominator (Zod validation)',
    );

    await user.clear(denominatorInput);
    await user.type(denominatorInput, '0');

    expect(
      screen.getByText('Denominator must be an integer between 1 and 1000'),
    ).toBeTruthy();

    await user.clear(denominatorInput);
    await user.type(denominatorInput, '5');

    expect(screen.getByText('Applied denominator 5')).toBeTruthy();
    expect(screen.getByText('Result: 12 / 5 = 2.40')).toBeTruthy();
  });
});
