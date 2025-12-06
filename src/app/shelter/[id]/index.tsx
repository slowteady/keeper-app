import { useLocalSearchParams } from 'expo-router';
import { Suspense, useCallback, useState } from 'react';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { ADOPT_LIST_FILTER, useShelter, useShelterAdoptList } from '@/entities';
import {
  Button,
  CallModal,
  Dropdown,
  ScrollUpButton,
  ShowMoreButton,
  SuspenseFallback,
  useScrollUpButton
} from '@/shared';
import { AdoptListSection, ShelterDetailDescriptionSection, ShelterDetailOverviewSection } from '@/widgets';

const Page = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!id) return null;

  return (
    <Container>
      <Suspense fallback={<SuspenseFallback />}>
        <ShelterDetailContent id={id} />
      </Suspense>
    </Container>
  );
};

export default Page;

const LIST_SIZE = 16;

const ShelterDetailContent = ({ id }: { id: string }) => {
  const [callModalOpen, setCallModalOpen] = useState(false);

  const { data: shelter, actions: shelterActions } = useShelter({ id });
  const {
    data: shelterAdopts,
    state: shelterAdoptsState,
    actions: shelterAdoptsActions,
    flags: shelterAdoptsFlags
  } = useShelterAdoptList({ id });
  const { handleScroll, handlePressButton, isButtonVisible, scrollRef } = useScrollUpButton();

  const refreshFetch = useCallback(async () => {
    await Promise.all([shelterActions.executeRefresh(), shelterAdoptsActions.executeRefresh()]);
  }, []);

  const hasCallNumber = !!shelter?.tel;

  const currentPage = (shelterAdopts.originalData?.page ?? 0) + 1;
  const totalPage = Math.ceil((shelterAdopts.originalData?.total ?? 0) / LIST_SIZE);
  const text = `더보기 ${currentPage}/${totalPage}`;

  return (
    <>
      <AdoptListSection
        ref={scrollRef}
        data={shelterAdopts.convertedData ?? []}
        isLoading={shelterAdoptsFlags.isLoading}
        onScroll={handleScroll}
        onRefreshCallback={refreshFetch}
        onPressItem={shelterAdoptsActions.goDetail}
        contentContainerStyle={{ paddingVertical: 32 }}
        header={
          <YStack mb={24}>
            <View mb={20}>
              <ShelterDetailOverviewSection data={shelter} />
            </View>
            <View mb={hasCallNumber ? 32 : 48}>
              <ShelterDetailDescriptionSection
                time={shelter.time}
                address={shelter.address}
                person={shelter.person}
                tel={shelter.tel ?? '정보 없음'}
              />
            </View>

            {hasCallNumber && (
              <View mb={48}>
                <Button size="large" onPress={() => setCallModalOpen((prev) => !prev)}>
                  <Text fontSize={15} fontWeight={600} lineHeight={18} color="$black900">
                    보호소에 문의하기
                  </Text>
                </Button>
              </View>
            )}

            <XStack items="flex-end" justify="space-between">
              <XStack gap={6} items="flex-end">
                <Text fontSize={20} fontWeight="600" lineHeight={24} letterSpacing={-0.25} color="$black800">
                  보호중인 아이들
                </Text>
                <Text fontSize={15} fontWeight="500" lineHeight={17} letterSpacing={-0.25} color="$black500">
                  {shelterAdopts.convertedData.length}마리
                </Text>
              </XStack>

              <Dropdown
                data={[...ADOPT_LIST_FILTER]}
                value={shelterAdoptsState.selectedFilter}
                onChange={(value) => shelterAdoptsActions.changeFilter(value.id)}
                snapPoints={[200]}
              />
            </XStack>
          </YStack>
        }
        footer={
          shelterAdoptsFlags.hasNextPage ? (
            <View mb={24} justify="center">
              <ShowMoreButton
                text={text}
                onPress={shelterAdoptsActions.fetchNextPage}
                isLoading={shelterAdoptsFlags.isFetchingNextPage}
              />
            </View>
          ) : undefined
        }
      />

      <ScrollUpButton visible={isButtonVisible} onPress={handlePressButton} />

      {hasCallNumber && (
        <CallModal
          open={callModalOpen}
          onClose={() => setCallModalOpen(false)}
          tel={shelter.tel!}
          title={`${shelter.name}에 문의하기`}
          description="*원활한 소통을 위해 상담원이 상담, 휴대폰 번호, 주소 등을 수집할 수 있습니다."
        />
      )}
    </>
  );
};

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
