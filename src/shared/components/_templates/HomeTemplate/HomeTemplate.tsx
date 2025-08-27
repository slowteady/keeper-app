import { FlatList, FlatListProps, RefreshControl } from 'react-native';
import { useTheme } from 'tamagui';

import { useRefreshing, useScrollFloatingButton } from '@/shared/hooks';

import { ScrollFloatingButton } from '../../atoms/ScrollFloatingButton';

export interface HomeTemplateProps extends FlatListProps<{ id: string; Component: React.ReactNode }> {
  onRefresh: () => Promise<void>;
}

const HomeTemplate = ({ onRefresh, ...props }: HomeTemplateProps) => {
  const { background } = useTheme();
  const { isButtonVisible, handlePress, handleScroll, flatListRef } = useScrollFloatingButton();
  const { refreshing, handleRefresh } = useRefreshing(onRefresh);

  return (
    <>
      <FlatList
        keyExtractor={({ id }, idx) => `${id}-${idx}`}
        ref={flatListRef}
        onScroll={handleScroll}
        scrollEventThrottle={40}
        initialNumToRender={2}
        style={{ backgroundColor: background.val }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        {...props}
      />
      <ScrollFloatingButton visible={isButtonVisible} onPress={handlePress} />
    </>
  );
};

export default HomeTemplate;
