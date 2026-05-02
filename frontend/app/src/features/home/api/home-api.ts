import { z } from 'zod';
import { requestJsonAsync } from '@/shared/api';

const homeUserSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  email: z.string().min(1),
  subscriptionPlan: z.string().min(1),
  credits: z.number().int().min(0),
});

const reportSchema = z.object({
  reportId: z.string().min(1),
  title: z.string().min(1),
  lastModifiedAt: z.string().min(1),
});

const reportListSchema = z.array(reportSchema);

type HomeUser = z.infer<typeof homeUserSchema>;
type HomeReport = z.infer<typeof reportSchema>;

export const fetchHomeUserAsync = async (): Promise<HomeUser> => {
  return requestJsonAsync({ path: '/api/users/me' }, homeUserSchema);
};

export const fetchHomeReportsAsync = async (): Promise<readonly HomeReport[]> => {
  return requestJsonAsync(
    { path: '/api/users/me/reports' },
    reportListSchema,
  );
};

export const createReportAsync = async (): Promise<string> => {
  return crypto.randomUUID();
};

export const deleteReportAsync = async (reportId: string): Promise<void> => {
  await requestJsonAsync(
    {
      path: `/api/report?reportId=${encodeURIComponent(reportId)}`,
      method: 'DELETE',
    },
    z.object({ deleted: z.boolean().optional() }),
  );
};

export type { HomeReport, HomeUser };
