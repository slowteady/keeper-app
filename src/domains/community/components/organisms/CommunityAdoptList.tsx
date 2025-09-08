import { FlashList } from '@shopify/flash-list';

import { CommunityAdoptCard, CommunityAdoptCardData } from './CommunityAdoptCard';

interface CommunityAdoptListProps {
  data: CommunityAdoptCardData[];
  onPressUser: (item: CommunityAdoptCardData) => void;
}

export const CommunityAdoptList = ({ data, onPressUser }: CommunityAdoptListProps) => {
  return (
    <FlashList
      data={data}
      renderItem={({ item }) => <CommunityAdoptCard {...item} onPressUser={() => onPressUser(item)} />}
      ListEmptyComponent={<></>}
      contentContainerStyle={{ paddingVertical: 24 }}
    />
  );
};
