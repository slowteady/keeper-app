import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { authApi } from '@/shared/api/instance';
import { ApiResponse } from '@/shared/model';

type CommunityPolicy = {
  agreed: boolean;
  version: string | null;
  agreedAt: string | null;
};

// baseURL 에 이미 '/api' 가 포함되므로 path 는 '/me/...' 부터 시작
const policyApi = {
  status: async (): Promise<CommunityPolicy> => {
    const res = await authApi.get<ApiResponse<CommunityPolicy>>('/me/community-policy');
    return res.data.data;
  },
  agree: async (): Promise<CommunityPolicy> => {
    const res = await authApi.post<ApiResponse<CommunityPolicy>>('/me/community-policy/agree');
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
