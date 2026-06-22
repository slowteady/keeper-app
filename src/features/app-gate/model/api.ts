import { z } from 'zod';

import { UrgentNoticeSchema } from '@/entities/notice';
import { publicApi } from '@/shared/api/instance';

export const bootstrapSchema = z.object({
  maintenance: z.boolean(),
  maintenanceMessage: z.string().nullable(),
  updateType: z.enum(['none', 'soft', 'hard']),
  latestVersion: z.string().nullable(),
  storeUrl: z.string().nullable(),
  urgentNotice: UrgentNoticeSchema.nullish()
});
export type BootstrapDto = z.infer<typeof bootstrapSchema>;

export const getBootstrap = async (platform: 'ios' | 'android', version: string) => {
  const res = await publicApi.get('/bootstrap', { params: { platform, version } });
  return bootstrapSchema.parse(res.data.data);
};
