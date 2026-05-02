import { useQuery } from '@tanstack/react-query';
import type { User } from '@my-app/types';
import { fetchUserAsync } from './fetch-user-async';

export const userQueryKey = ['user-profile'] as const;

export const useUserQuery = () => {
  return useQuery<User, Error>({
    queryKey: userQueryKey,
    queryFn: fetchUserAsync,
    staleTime: 1000 * 60 * 5,
  });
};