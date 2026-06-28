import { useQuery } from '@tanstack/react-query';

import { notificationQueries } from '@/entities/notification';
import { useCurrentUser } from '@/features/auth';

export const useUnreadCount = () => {
  const { isLoggedIn } = useCurrentUser();

  const { data } = useQuery({
    ...notificationQueries.unreadCount(),
    enabled: isLoggedIn
  });

  const count = data?.count ?? 0;
  const badge = count > 99 ? '99+' : count > 0 ? String(count) : null;

  return { count, badge };
};
