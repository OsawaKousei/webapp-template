import {
  DeleteReportRequestSchema,
  DeleteReportResponseSchema,
  FetchCurrentUserResponseSchema,
  FetchUserReportsResponseSchema,
  type FetchCurrentUserResponse,
  type FetchUserReportsResponse,
} from '@my-app/types';
import { requestJsonAsync } from '@/shared/api';

type HomeUser = FetchCurrentUserResponse;
type HomeReport = FetchUserReportsResponse[number];

export const fetchHomeUserAsync = async (): Promise<HomeUser> => {
  return requestJsonAsync(
    { path: '/api/users/me' },
    FetchCurrentUserResponseSchema,
  );
};

export const fetchHomeReportsAsync = async (): Promise<readonly HomeReport[]> => {
  return requestJsonAsync({ path: '/api/users/me/reports' }, FetchUserReportsResponseSchema);
};

export const createReportAsync = async (): Promise<void> => {
  return;
};

export const deleteReportAsync = async (reportId: string): Promise<void> => {
  const request = DeleteReportRequestSchema.parse({ reportId });

  await requestJsonAsync(
    {
      path: `/api/report?reportId=${encodeURIComponent(request.reportId)}`,
      method: 'DELETE',
    },
    DeleteReportResponseSchema,
  );
};

export type { HomeReport, HomeUser };
