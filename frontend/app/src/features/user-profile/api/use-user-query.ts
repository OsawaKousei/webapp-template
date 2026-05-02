import { useQuery } from '@tanstack/react-query';
import { fetchUserAsync } from './fetch-user-async';

type User = Awaited<ReturnType<typeof fetchUserAsync>>;

export const userQueryKey = ['user-profile'] as const;

export const useUserQuery = () => {
  return useQuery<User, Error>({
    queryKey: userQueryKey,
    queryFn: fetchUserAsync,
    staleTime: 1000 * 60 * 5,
  });
};
