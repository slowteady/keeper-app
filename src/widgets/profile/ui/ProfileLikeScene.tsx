import { ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback } from 'react';
import { styled, View, YStack } from 'tamagui';

import { AdoptCard, AdoptItem, useAdoptList } from '@/entities/adopt';
import { makeProfileOption, ProfileLikeOption } from '@/entities/profile';
import { useProfileLikeFilter } from '@/features/profile';
import { useScrollUpButton } from '@/shared/model';
import { ButtonGroup, ScrollUpButton } from '@/shared/ui';
import { AdoptListSection } from '@/widgets/adopt-section';

export const ProfileLikeScene = () => {
  const { state: filterState, actions: filterActions } = useProfileLikeFilter();
  const { data: adoptData, actions: adoptActions, flags: adoptFlags } = useAdoptList({ size: 16 });

  const { handleScroll, handlePressButton, isButtonVisible, scrollRef } = useScrollUpButton();

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<AdoptItem>, filter: ProfileLikeOption) => {
      switch (filter) {
        case 'adopt': {
          const isLeft = index % 2 === 0;

          return (
            <View pl={isLeft ? 0 : 4} pr={isLeft ? 4 : 0} mb={32} onPress={() => adoptActions.goDetail(item.id)}>
              <AdoptCard uri={item.uri} title={item.title} description={item.description} chips={item.chips} />
            </View>
          );
        }
        default: {
          return null;
        }
      }
    },
    [adoptActions]
  );

  return (
    <Container>
      <AdoptListSection
        ref={scrollRef}
        data={adoptData.convertedData ?? []}
        isLoading={adoptFlags.isLoading}
        onScroll={handleScroll}
        onRefreshCallback={adoptActions.executeRefresh}
        renderItem={(p) => renderItem(p, filterState.filter)}
        header={
          <View mb={20}>
            <ButtonGroup
              data={makeProfileOption('LIKE')}
              id={filterState.filter}
              onChange={(id) => filterActions.toggleFilter(id)}
            />
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
