import { FlashList } from '@shopify/flash-list';
import { styled, View } from 'tamagui';

import { CommunityAdoptCard, CommunityAdoptCardData } from './CommunityAdoptCard';

interface CommunityAdoptListProps {
  data: CommunityAdoptCardData[];
  onPressUser: (item: CommunityAdoptCardData) => void;
  onPressCard: (id: string) => void;
}

export const CommunityAdoptList = ({ data, onPressUser, onPressCard }: CommunityAdoptListProps) => {
  return (
    <FlashList
      data={data}
      renderItem={({ item }) => (
        <View px={20}>
          <CommunityAdoptCard
            {...item}
            onPressUser={() => onPressUser(item)}
            onPressCard={() => onPressCard(item.id)}
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
