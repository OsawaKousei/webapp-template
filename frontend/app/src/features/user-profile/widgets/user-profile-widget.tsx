import { UserProfileView } from '../components/user-profile-view';
import { useUserQuery } from '../api/use-user-query';

export const UserProfileWidget = () => {
  const userQuery = useUserQuery();

  if (userQuery.isPending) {
    return <UserProfileView state={{ status: 'loading' }} />;
  }

  if (userQuery.isError) {
    return (
      <UserProfileView
        state={{
          status: 'error',
          message: userQuery.error.message,
          onRetry: () => {
            void userQuery.refetch();
          },
        }}
      />
    );
  }

  return (
    <UserProfileView
      state={{
        status: 'success',
        user: userQuery.data,
        onRefresh: () => {
          void userQuery.refetch();
        },
      }}
    />
  );
};
