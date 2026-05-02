import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { UserProfileWidget } from '../../src/features/user-profile';

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

const renderWithQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <UserProfileWidget />
    </QueryClientProvider>,
  );
};

describe('UserProfileWidget', () => {
  it('renders user fields when API returns success', async () => {
    server.use(
      http.get('/api/user', () => {
        return HttpResponse.json({
          id: 'user-1',
          name: 'Hanako',
          email: 'hanako@example.com',
          status: 'active',
        });
      }),
    );

    renderWithQueryClient();

    expect(await screen.findByText('Hanako')).toBeInTheDocument();
    expect(screen.getByText('hanako@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('shows error and retries successfully', async () => {
    let shouldFail = true;

    server.use(
      http.get('/api/user', () => {
        if (shouldFail) {
          return new HttpResponse(null, { status: 500 });
        }

        return HttpResponse.json({
          id: 'user-2',
          name: 'Taro',
          email: 'taro@example.com',
          status: 'inactive',
        });
      }),
    );

    renderWithQueryClient();

    expect(
      await screen.findByText('Failed to fetch user profile'),
    ).toBeInTheDocument();

    shouldFail = false;

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Retry Fetch' }));

    await waitFor(() => {
      expect(screen.getByText('Taro')).toBeInTheDocument();
    });
  });
});
