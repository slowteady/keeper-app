import { FlashList } from '@shopify/flash-list';
import { styled, View } from 'tamagui';

import { CommunityAdoptCard, CommunityAdoptCardData } from './CommunityAdoptCard';

interface CommunityAdoptListProps {
  data: CommunityAdoptCardData[];
  onPressUser: (item: CommunityAdoptCardData['user']) => void;
  onPressCard: (id: string) => void;
  onPressLike: (id: string) => void;
  isLoading?: boolean;
}

export const CommunityAdoptList = ({
  data,
  onPressUser,
  onPressCard,
  onPressLike,
  isLoading
}: CommunityAdoptListProps) => {
  return (
    <FlashList
      data={data}
      renderItem={({ item }) => (
        <View px={20}>
          <CommunityAdoptCard
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
  bg: '$white600'
});
