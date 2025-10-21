import { FlashList } from '@shopify/flash-list';
import { styled, View } from 'tamagui';

import { AdoptCard, AdoptCardSchema } from './AdoptCard';

export interface AdoptListProps {
  data: AdoptCardSchema[];
  onPressUser: (item: AdoptCardSchema['user']) => void;
  onPressCard: (id: string) => void;
  onPressLike: (id: string) => void;
  isLoading?: boolean;
}

export const AdoptList = ({ data, onPressUser, onPressCard, onPressLike, isLoading }: AdoptListProps) => {
  return (
    <FlashList
      data={data}
      renderItem={({ item }) => (
        <View px={20} py={32}>
          <AdoptCard
            {...item}
            onPressUser={() => onPressUser(item.user)}
            onPressCard={() => onPressCard(item.id)}
            onPressLike={() => onPressLike(item.id)}
            isLoading={isLoading}
          />
        </View>
      )}
      ListEmptyComponent={<></>}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <Divider />}
    />
  );
};

const Divider = styled(View, {
  height: 1,
  bg: '$white800'
});
