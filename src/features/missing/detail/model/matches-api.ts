import { z } from 'zod';

import { AdoptDataDto, AdoptDataSchema } from '@/entities/adopt';
import { authApi } from '@/shared/api';
import { ApiResponse } from '@/shared/model';

export const getMissingMatches = async (id: string): Promise<AdoptDataDto[]> => {
  const res = await authApi.get<ApiResponse<AdoptDataDto[]>>(`/missing/${id}/matches`);
  return z.array(AdoptDataSchema).parse(res.data.data);
};
