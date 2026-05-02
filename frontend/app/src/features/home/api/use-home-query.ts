import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createReportAsync,
  deleteReportAsync,
  fetchHomeReportsAsync,
  fetchHomeUserAsync,
} from './home-api';

export const homeUserQueryKey = ['home-user'] as const;
export const homeReportsQueryKey = ['home-reports'] as const;

export const useHomeUserQuery = () => {
  return useQuery({
    queryKey: homeUserQueryKey,
    queryFn: fetchHomeUserAsync,
  });
};

export const useHomeReportsQuery = () => {
  return useQuery({
    queryKey: homeReportsQueryKey,
    queryFn: fetchHomeReportsAsync,
  });
};

export const useCreateReportMutation = () => {
  return useMutation({
    mutationFn: createReportAsync,
  });
};

export const useDeleteReportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReportAsync,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: homeReportsQueryKey,
      });
    },
  });
};
