import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeView } from '../components/home-view';
import {
  useCreateReportMutation,
  useDeleteReportMutation,
  useHomeReportsQuery,
  useHomeUserQuery,
} from '../api/use-home-query';
import type { HomeReport } from '../api/home-api';

export const HomeWidget = () => {
  const navigate = useNavigate();
  const userQuery = useHomeUserQuery();
  const reportsQuery = useHomeReportsQuery();
  const createMutation = useCreateReportMutation();
  const deleteMutation = useDeleteReportMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [deletingTarget, setDeletingTarget] = useState<HomeReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const noop = () => undefined;

  const filteredProjects = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();

    if (reportsQuery.data === undefined) {
      return [] as const;
    }

    return reportsQuery.data.filter((report) => {
      return report.title.toLowerCase().includes(normalizedQuery);
    });
  }, [reportsQuery.data, searchQuery]);

  if (userQuery.isPending) {
    return (
      <HomeView
        user={{
          displayName: '-',
          email: '-',
          subscriptionPlan: '-',
          credits: 0,
        }}
        projects={[]}
        searchQuery={searchQuery}
        errorMessage={null}
        isLoading
        isCreating={false}
        deletingId={null}
        deletingTarget={null}
        onSearchChange={setSearchQuery}
        onCreate={noop}
        onOpenReport={noop}
        onDeleteClick={noop}
        onDeleteCancel={noop}
        onDeleteConfirm={noop}
        onLogout={() => {
          navigate('/login');
        }}
      />
    );
  }

  if (userQuery.isError) {
    navigate('/login');
    return null;
  }

  return (
    <HomeView
      user={userQuery.data}
      projects={filteredProjects}
      searchQuery={searchQuery}
      errorMessage={errorMessage}
      isLoading={reportsQuery.isPending}
      isCreating={createMutation.isPending}
      deletingId={
        deleteMutation.isPending ? (deletingTarget?.reportId ?? null) : null
      }
      deletingTarget={deletingTarget}
      onSearchChange={setSearchQuery}
      onCreate={async () => {
        setErrorMessage(null);

        try {
          const reportId = await createMutation.mutateAsync();
          navigate(`/new-report/${reportId}`);
        } catch (error: unknown) {
          const message =
            error instanceof Error
              ? error.message
              : 'レポート作成に失敗しました。';
          setErrorMessage(message);
        }
      }}
      onOpenReport={(reportId) => {
        navigate(`/report/${reportId}`);
      }}
      onDeleteClick={(project) => {
        setDeletingTarget(project);
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
      onLogout={() => {
        navigate('/login');
      }}
    />
  );
};
