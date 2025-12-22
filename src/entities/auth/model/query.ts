import { USER_QUERY_KEY } from '@/shared';

import { getUser } from './api';

export const useGetUser = () => ({
  queryKey: [USER_QUERY_KEY],
  queryFn: () => getUser()
});
