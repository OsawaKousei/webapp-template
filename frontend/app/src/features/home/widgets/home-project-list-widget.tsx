import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeProjectListView } from '../components/home-project-list-view';
import {
  useCreateReportMutation,
  useDeleteReportMutation,
  useHomeReportsQuery,
} from '../api/use-home-query';
import type { HomeReport } from '../api/home-api';

export const HomeProjectListWidget = () => {
  const navigate = useNavigate();
  const reportsQuery = useHomeReportsQuery();
  const createMutation = useCreateReportMutation();
  const deleteMutation = useDeleteReportMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [deletingTarget, setDeletingTarget] = useState<HomeReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    const projectList = reportsQuery.data ?? [];

    return projectList.filter((report) => {
      return report.title.toLowerCase().includes(normalizedQuery);
    });
  }, [reportsQuery.data, searchQuery]);

  const state = (() => {
    if (reportsQuery.isPending) {
      return { status: 'loading' } as const;
    }

    if (reportsQuery.isError) {
      return {
        status: 'error',
        message: reportsQuery.error.message,
        onRetry: () => {
          void reportsQuery.refetch();
        },
      } as const;
    }

    if (filteredProjects.length === 0) {
      return {
        status: 'empty',
        hasQuery: searchQuery.trim().length > 0,
      } as const;
    }

    return {
      status: 'ready',
      projects: filteredProjects,
      deletingId: deleteMutation.isPending
        ? (deletingTarget?.reportId ?? null)
        : null,
      onOpenReport: (reportId: string) => {
        navigate(`/report/${reportId}`);
      },
      onDeleteClick: (project: HomeReport) => {
        setDeletingTarget(project);
      },
    } as const;
  })();

  return (
    <HomeProjectListView
      state={state}
      searchQuery={searchQuery}
      errorMessage={errorMessage}
      isCreating={createMutation.isPending}
      deletingTarget={deletingTarget}
      isDeleting={deleteMutation.isPending}
      onSearchChange={setSearchQuery}
      onCreate={async () => {
        setErrorMessage(null);

        try {
          await createMutation.mutateAsync();
          navigate('/new-report');
        } catch (error: unknown) {
          const message =
            error instanceof Error
              ? error.message
              : 'レポート作成に失敗しました。';
          setErrorMessage(message);
        }
      }}
      onDeleteCancel={() => {
        setDeletingTarget(null);
      }}
      onDeleteConfirm={async () => {
        if (deletingTarget === null) {
          return;
        }

        try {
          await deleteMutation.mutateAsync(deletingTarget.reportId);
          setDeletingTarget(null);
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : '削除に失敗しました。';
          setErrorMessage(message);
        }
      }}
    />
  );
};
