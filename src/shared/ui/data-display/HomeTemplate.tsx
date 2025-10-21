import { FlatList, FlatListProps, RefreshControl } from 'react-native';
import { useTheme } from 'tamagui';

import { ScrollFloatingButton, useRefreshing, useScrollFloatingButton } from '@/shared';

export interface HomeTemplateProps extends FlatListProps<{ id: string; Component: React.ReactNode }> {
  onRefresh: () => Promise<void>;
}

export const HomeTemplate = ({ onRefresh, ...props }: HomeTemplateProps) => {
  const { white900 } = useTheme();
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
        style={{ backgroundColor: white900.val }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        {...props}
      />
      <ScrollFloatingButton visible={isButtonVisible} onPress={handlePress} />
    </>
  );
};
