import { usePathname } from 'expo-router';
import { useAtomValue } from 'jotai';
import { Dimensions } from 'react-native';
import { View } from 'tamagui';

import { adoptFilterAtomFamily } from '@/domains/animal/stores';
import { useRefreshing, useScrollFloatingButton } from '@/shared/hooks';

import { AdoptTemplateProps } from './AdoptTemplate.types';

const PADDING_HORIZONTAL = 20;
const CARD_GAP = 8;
const IMAGE_WIDTH = (Dimensions.get('screen').width - 2 * PADDING_HORIZONTAL - CARD_GAP) / 2;

const AdoptTemplate = ({ data, onFetch, isLoading, onRefresh, refreshControl }: AdoptTemplateProps) => {
  const pathname = usePathname();
  const adoptFilter = useAtomValue(adoptFilterAtomFamily(pathname));

  const { isButtonVisible, handlePress, handleScroll, flatListRef } = useScrollFloatingButton();
  const { refreshing, handleRefresh } = useRefreshing(onRefresh);

  const { has_next, page, total, value = [] } = data || {};

  return <View></View>;
};

export default AdoptTemplate;
