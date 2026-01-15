import { useState } from 'react';

import { ProfileLikeOption } from '@/entities/profile';

export const useProfileLikeFilter = () => {
  const [filter, setFilter] = useState<ProfileLikeOption>('adopt');

  return {
    state: { filter },
    actions: { toggleFilter: setFilter }
  };
};
