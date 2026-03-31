import { ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback } from 'react';
import { styled, View, YStack } from 'tamagui';

import { AdoptCard } from '@/entities/adopt';
import { makeProfileOption, ProfileLikeOption } from '@/entities/profile';
import { AdoptItem } from '@/features/adopt';
import { useScrollUpButton } from '@/shared/model';
import { ButtonGroup, ScrollUpButton } from '@/shared/ui';
import { AdoptListSection } from '@/widgets/adopt-section';

export interface ProfileLikeSceneProps {
  filter: ProfileLikeOption;
  convertedData: AdoptItem[];
  isLoading: boolean;
  onToggleFilter: (id: ProfileLikeOption) => void;
  onGoDetail: (id: string) => void;
  onRefresh: () => Promise<void>;
}

export const ProfileLikeScene = ({
  filter,
  convertedData,
  isLoading,
  onToggleFilter,
  onGoDetail,
  onRefresh
}: ProfileLikeSceneProps) => {
  const { handleScroll, handlePressButton, isButtonVisible, scrollRef } = useScrollUpButton();

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<AdoptItem>, filter: ProfileLikeOption) => {
      switch (filter) {
        case 'adopt': {
          const isLeft = index % 2 === 0;

          return (
            <View pl={isLeft ? 0 : 4} pr={isLeft ? 4 : 0} mb={32} onPress={() => onGoDetail(item.id)}>
              <AdoptCard uri={item.uri} title={item.title} description={item.description} chips={item.chips} />
            </View>
          );
        }
        default: {
          return null;
        }
      }
    },
    [onGoDetail]
  );

  return (
    <Container>
      <AdoptListSection
        ref={scrollRef}
        data={convertedData ?? []}
        isLoading={isLoading}
        onScroll={handleScroll}
        onRefreshCallback={onRefresh}
        renderItem={(p) => renderItem(p, filter)}
        header={
          <View mb={20}>
            <ButtonGroup data={makeProfileOption('LIKE')} id={filter} onChange={(id) => onToggleFilter(id)} />
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />

      <ScrollUpButton visible={isButtonVisible} onPress={handlePressButton} />
    </Container>
  );
};

const Container = styled(YStack, {
  flex: 1,
  py: 16
});
