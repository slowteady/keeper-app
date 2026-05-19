import { useLocalSearchParams } from 'expo-router';
import { Suspense, useMemo, useState } from 'react';
import { ScrollView, styled, Text, View } from 'tamagui';

import { buildAdoptShareDesc } from '@/entities/adopt';
import { useAdopt } from '@/features/adopt';
import { useFavoriteAbandonment } from '@/features/favorite-abandonment';
import { useShelter } from '@/features/shelter';
import { validateAndSanitizeTel } from '@/shared/lib';
import { useShare } from '@/shared/model';
import { BottomButton, CallModal, DetailErrorBoundary, SuspenseFallback } from '@/shared/ui';
import {
  AdoptDetailDescriptionSection,
  AdoptDetailInfoSection,
  AdoptDetailOverviewSection
} from '@/widgets/adopt-section';

export const ErrorBoundary = DetailErrorBoundary;

const Page = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!id) return null;

  return (
    <Container>
      <Suspense fallback={<SuspenseFallback />}>
        <AdoptDetailContent id={id} />
      </Suspense>
    </Container>
  );
};

export default Page;

const AdoptDetailContent = ({ id }: { id: string }) => {
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [buttonHeight, setButtonHeight] = useState(0);

  const { adopt } = useAdopt({ id });
  const { shelterData } = useShelter({ id: adopt.shelterId });
  const { toggleFavoriteAbandonment } = useFavoriteAbandonment();
  const { share } = useShare();

  // shelter 마스터 매칭 실패 (careRegNo 미등록 보호소, 약 15%) 시 abandonment 응답으로 fallback.
  // abandonment.careTel/careNm/careAddr 는 공공데이터 원본 100% 채워져 있어 문의하기 버튼이 거의 항상 노출된다.
  const shelter = useMemo(
    () =>
      shelterData ?? {
        id: adopt.shelterId,
        name: adopt.careNm ?? '',
        address: adopt.careAddr ?? '',
        tel: validateAndSanitizeTel(adopt.careTel ?? null),
        time: '정보 없음',
        person: '정보 없음'
      },
    [shelterData, adopt.shelterId, adopt.careNm, adopt.careAddr, adopt.careTel]
  );
  const hasCallNumber = !!shelter.tel;

  const handlePressShare = () => {
    share({
      title: adopt.title,
      desc: buildAdoptShareDesc(adopt),
      path: 'adopt',
      id: adopt.id,
      image: adopt.images[0]
    });
  };

  return (
    <>
      <ScrollView
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          { position: 'relative', paddingTop: 48, paddingBottom: hasCallNumber ? buttonHeight : 0 } as any
        }
      >
        <View mb={30} px={20}>
          <AdoptDetailOverviewSection
            title={adopt.title}
            images={adopt.images}
            description={adopt.description}
            isFavorited={adopt.isFavorited}
            onPressFavorite={() => toggleFavoriteAbandonment(adopt.id, adopt.isFavorited ?? false)}
            onPressShare={handlePressShare}
          />
        </View>

        <Divider mb={30} />

        <View px={20} pb={48}>
          <AdoptDetailInfoSection
            age={adopt.age}
            gender={adopt.gender}
            weight={adopt.weight}
            healthCheck={adopt.healthCheck ?? ''}
            neuterYn={adopt.neuterYn}
            vaccinationCheck={adopt.vaccinationCheck ?? ''}
          />
        </View>

        <View px={20}>
          <AdoptDetailDescriptionSection
            specialMark={adopt.specialMark}
            shelter={shelter}
            hasCallNumber={hasCallNumber}
          />
        </View>
      </ScrollView>

      {hasCallNumber && (
        <>
          <BottomButton
            onPress={() => setCallModalOpen((prev) => !prev)}
            onLayout={(e) => setButtonHeight(e.nativeEvent.layout.height)}
          >
            <Text fontSize={15} fontWeight={600} lineHeight={18} color="$black900">
              보호소에 문의하기
            </Text>
          </BottomButton>

          <CallModal
            open={callModalOpen}
            onClose={() => setCallModalOpen(false)}
            tel={shelter?.tel!}
            title={`${shelter?.name}에 문의하기`}
            description="*원활한 소통을 위해 상담원이 상담, 휴대폰 번호, 주소 등을 수집할 수 있습니다"
          />
        </>
      )}
    </>
  );
};

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});

const Divider = styled(View, {
  height: 8,
  bg: '$white850'
});
