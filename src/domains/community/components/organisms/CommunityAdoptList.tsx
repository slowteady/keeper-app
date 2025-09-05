import { FlashList } from '@shopify/flash-list';

import { CommunityAdoptCard } from './CommunityAdoptCard';

interface CommunityAdoptListProps {
  data: {
    user: { image: string; nickname: string };
    displayTime: string;
  }[];
}

export const CommunityAdoptList = ({ data }: CommunityAdoptListProps) => {
  return (
    <FlashList
      data={data}
      renderItem={({ item }) => <CommunityAdoptCard {...item} onPressUser={() => {}} />}
      ListEmptyComponent={<></>}
      contentContainerStyle={{ paddingVertical: 24 }}
    />
  );
};
