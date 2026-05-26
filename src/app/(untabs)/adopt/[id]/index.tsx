import { useLocalSearchParams } from 'expo-router';
import { Suspense, useMemo, useState } from 'react';
import { ScrollView, styled, Text, View } from 'tamagui';

import { ADOPT_STATUS_INFO, AdoptStatusDto, buildAdoptShareDesc, isAdoptEnded } from '@/entities/adopt';
import { resolveAdoptShelter, useAdopt } from '@/features/adopt';
import { useFavoriteAbandonment } from '@/features/favorite-abandonment';
import { useShelter } from '@/features/shelter';
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

  // 정책은 resolveAdoptShelter JSDoc 참조 (전화=공고 우선, 그 외=마스터 우선)
  const shelter = useMemo(() => resolveAdoptShelter(adopt, shelterData), [adopt, shelterData]);
  const ended = isAdoptEnded(adopt.status);
  const hasCallNumber = !!shelter.tel && !ended;

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
        {ended && adopt.status && <AdoptEndedBanner status={adopt.status} />}

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
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              setButtonHeight((prev) => (prev === h ? prev : h));
            }}
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

const AdoptEndedBanner = ({ status }: { status: AdoptStatusDto }) => {
  if (status === 'PROTECTING') return null;
  const info = ADOPT_STATUS_INFO[status];
  if (!info) return null;
  return (
    <BannerWrap tone={info.tone}>
      <BannerLabel tone={info.tone}>{info.label}</BannerLabel>
      <BannerText tone={info.tone}>{info.bannerText}</BannerText>
    </BannerWrap>
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

const BannerWrap = styled(View, {
  mx: 20,
  mt: -16,
  mb: 24,
  px: 16,
  py: 14,
  rounded: 10,
  variants: {
    tone: {
      positive: { backgroundColor: '$successLightest' },
      neutral: { backgroundColor: '$backgroundDefault' }
    }
  } as const
});

const BannerLabel = styled(Text, {
  fontWeight: 700,
  fontSize: 13,
  lineHeight: 15,
  mb: 4,
  variants: {
    tone: {
      positive: { color: '$successMain' },
      neutral: { color: '$black700' }
    }
  } as const
});

const BannerText = styled(Text, {
  fontWeight: 500,
  fontSize: 15,
  lineHeight: 20,
  variants: {
    tone: {
      positive: { color: '$black900' },
      neutral: { color: '$black700' }
    }
  } as const
});
