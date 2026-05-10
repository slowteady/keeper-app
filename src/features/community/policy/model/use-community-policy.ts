import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { authApi } from '@/shared/api/instance';
import { ApiResponse } from '@/shared/model';

type CommunityPolicy = {
  agreed: boolean;
  version: string | null;
  agreedAt: string | null;
};

const policyApi = {
  status: async (): Promise<CommunityPolicy> => {
    const res = await authApi.get<ApiResponse<CommunityPolicy>>('/api/me/community-policy');
    return res.data.data;
  },
  agree: async (): Promise<CommunityPolicy> => {
    const res = await authApi.post<ApiResponse<CommunityPolicy>>('/api/me/community-policy/agree');
    return res.data.data;
  }
};

export const useCommunityPolicyStatus = (enabled = true) =>
  useQuery({
    queryKey: ['community-policy'],
    queryFn: policyApi.status,
    enabled
  });

export const useAgreeCommunityPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: policyApi.agree,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-policy'] });
    }
  });
};
