import { ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback } from 'react';
import { styled, View, YStack } from 'tamagui';

import { AdoptCard, AdoptItem } from '@/entities/adopt';
import { PROFILE_OPTIONS, ProfileLikeOption } from '@/entities/profile';
import { useFavoriteAbandonment } from '@/features/favorite-abandonment';
import { ButtonGroup } from '@/shared/ui';
import { AdoptListSection } from '@/widgets/adopt-section';

export type ProfileLikeSceneProps = {
  filter: ProfileLikeOption;
  convertedData: AdoptItem[];
  isLoading: boolean;
  onToggleFilter: (id: ProfileLikeOption) => void;
  onGoDetail: (id: string) => void;
  onRefresh: () => Promise<void>;
};

export const ProfileLikeScene = ({
  filter,
  convertedData,
  isLoading,
  onToggleFilter,
  onGoDetail,
  onRefresh
}: ProfileLikeSceneProps) => {
  const { toggleFavoriteAbandonment } = useFavoriteAbandonment();

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<AdoptItem>, filter: ProfileLikeOption) => {
      switch (filter) {
        case 'adopt': {
          const isLeft = index % 2 === 0;

          return (
            <View pl={isLeft ? 0 : 4} pr={isLeft ? 4 : 0} mb={32}>
              <AdoptCard
                uri={item.uri}
                title={item.title}
                description={item.description}
                chips={item.chips}
                isFavorited={item.isFavorited}
                status={item.status}
                onPress={() => onGoDetail(item.id)}
                onPressFavorite={() => toggleFavoriteAbandonment(item.id, item.isFavorited ?? false)}
              />
            </View>
          );
        }
        default: {
          return null;
        }
      }
    },
    [onGoDetail, toggleFavoriteAbandonment]
  );

  return (
    <Container>
      <AdoptListSection
        data={convertedData ?? []}
        isLoading={isLoading}
        onRefreshCallback={onRefresh}
        renderItem={(p) => renderItem(p, filter)}
        header={
          <View mb={20}>
            <ButtonGroup data={PROFILE_OPTIONS.LIKE} id={filter} onChange={(id) => onToggleFilter(id)} />
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />
    </Container>
  );
};

const Container = styled(YStack, {
  flex: 1,
  py: 16
});
