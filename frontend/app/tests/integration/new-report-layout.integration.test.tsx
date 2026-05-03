import {
  beforeAll,
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { NewReportLayout } from '@/features/new-report/layouts/new-report-layout';
import { initialState } from '@/features/new-report/stores/new-report-store-state';
import { useNewReportStore } from '@/features/new-report/stores/use-new-report-store';

const server = setupServer(
  http.post('*/api/ai/generate-outline', () => {
    return HttpResponse.json({
      success: true,
      data: {
        title: '自動生成目次',
        outline: {
          items: [
            { order: 1, title: '導入', summary: '背景を説明する' },
            { order: 2, title: '分析', summary: 'データを分析する' },
          ],
        },
      },
    });
  }),
  http.post('*/api/ai/generate-report', () => {
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL',
          message: '生成APIエラー',
        },
      },
      { status: 500 },
    );
  }),
);

const resetStore = () => {
  useNewReportStore.setState((state) => {
    return {
      ...initialState,
      actions: state.actions,
    };
  });
};

const renderLayout = () => {
  return render(
    <MemoryRouter initialEntries={['/new-report']}>
      <Routes>
        <Route path="/new-report" element={<NewReportLayout />} />
        <Route path="/home" element={<p>home</p>} />
        <Route path="/report/:id" element={<p>report</p>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('NewReportLayout integration', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    window.sessionStorage.clear();
    resetStore();
  });

  it('概要入力後に次へでフェーズ2へ遷移する', async () => {
    renderLayout();

    fireEvent.change(
      screen.getByPlaceholderText('レポート概要を入力してください'),
      {
        target: { value: '市場分析の概要' },
      },
    );

    fireEvent.click(screen.getByRole('button', { name: '次へ' }));

    await waitFor(() => {
      expect(screen.getByText('参考資料')).toBeInTheDocument();
    });
  });

  it('口調フェーズでAI目次作成を実行すると目次フェーズに進み結果が表示される', async () => {
    renderLayout();

    fireEvent.change(
      screen.getByPlaceholderText('レポート概要を入力してください'),
      {
        target: { value: '生成テスト用の概要' },
      },
    );
    fireEvent.click(screen.getByRole('button', { name: '次へ' }));
    fireEvent.click(screen.getByRole('button', { name: '次へ' }));
    fireEvent.click(screen.getByRole('button', { name: 'AIで目次を作成' }));

    await waitFor(() => {
      expect(screen.getByDisplayValue('導入')).toBeInTheDocument();
      expect(screen.getByDisplayValue('分析')).toBeInTheDocument();
    });
  });

  it('生成API失敗時にエラーメッセージを表示する', async () => {
    window.sessionStorage.setItem('report_current_phase', '4');
    window.sessionStorage.setItem('report_text_overview', '最終生成テスト概要');
    window.sessionStorage.setItem(
      'outline_items',
      JSON.stringify([{ order: 1, title: '目次', summary: '要約' }]),
    );

    renderLayout();

    fireEvent.click(screen.getByRole('button', { name: 'AIでレポートを生成' }));

    await waitFor(() => {
      expect(screen.getByText('生成APIエラー')).toBeInTheDocument();
    });
  });
});
