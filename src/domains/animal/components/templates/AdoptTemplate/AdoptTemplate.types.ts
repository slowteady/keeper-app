import { FlatListProps } from 'react-native';

import { AdoptResponse } from '@/domains/animal/types';

export interface AdoptTemplateProps extends FlatListProps<AdoptResponse> {
  onFetch: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}
