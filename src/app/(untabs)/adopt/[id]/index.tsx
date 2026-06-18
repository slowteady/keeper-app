import { ChevronRight, Clock, MapPin } from '@tamagui/lucide-icons';
import { RelativePathString, router, useLocalSearchParams } from 'expo-router';
import { Suspense, useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import { ScrollView, styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

import { ADOPT_STATUS_INFO, AdoptStatusDto, isAdoptEnded } from '@/entities/adopt';
import { resolveAdoptShelter, useAdopt } from '@/features/adopt';
import { useFavoriteAbandonment } from '@/features/favorite-abandonment';
import { useShelter } from '@/features/shelter';
import { useShare } from '@/shared/model';
import { BottomButton, CallModal, Carousel, DetailErrorBoundary, SuspenseFallback } from '@/shared/ui';
import { AnimatedHeart } from '@/shared/ui/icons/animation';
import { Share as ShareIcon } from '@/shared/ui/icons/outline';
import { AdoptDetailDescriptionSection, DetailSpecSection } from '@/widgets/adopt-section';
import { CommunityDetailHealthSection } from '@/widgets/community-adopt-feed-section';

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
  const { black600 } = useTheme();

  const { adopt } = useAdopt({ id });
  const { shelterData } = useShelter({ id: adopt.shelterId });
  const { toggleFavoriteAbandonment } = useFavoriteAbandonment();
  const { share } = useShare();

  // 정책은 resolveAdoptShelter JSDoc 참조 (전화=공고 우선, 그 외=마스터 우선)
  const shelter = useMemo(() => resolveAdoptShelter(adopt, shelterData), [adopt, shelterData]);
  const ended = isAdoptEnded(adopt.status);
  const canCall = !!shelter.tel;
  const ctaDisabled = ended || !canCall;

  const descValue = (label: string) => adopt.description.find((d) => d.label === label)?.value ?? '';
  const region = descValue('지역');
  const noticePeriod = descValue('공고기간');
  const rescuePlace = descValue('구조장소');

  const basicRows = [
    { label: '품종', value: adopt.title },
    ...(region ? [{ label: '지역', value: region }] : []),
    { label: '나이', value: adopt.age },
    { label: '성별', value: adopt.gender },
    { label: '크기·몸무게', value: adopt.weight }
  ].filter((r) => !!r.value && r.value !== '모름' && r.value !== '미상');

  const handlePressShare = () => {
    share({ type: 'adopt', id: adopt.id });
  };

  return (
    <>
      <ScrollView
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 0, paddingBottom: buttonHeight + 40 } as never}
      >
        {ended && adopt.status && <AdoptEndedBanner status={adopt.status} />}

        {adopt.images.length > 0 && (
          <Hero mb={16}>
            <Carousel data={adopt.images} showIndicator showImageViewer imageRadius={0} />
          </Hero>
        )}

        <ActionRow px={20} mb={24}>
          {!!shelter.name && (
            <Pressable
              hitSlop={8}
              style={{ flex: 1 }}
              onPress={() => router.push(`/shelter/${shelter.id}` as RelativePathString)}
            >
              <ShelterLinkRow>
                <ShelterLink numberOfLines={1}>{shelter.name}</ShelterLink>
                <ChevronRight size={16} color={black600.val as never} />
              </ShelterLinkRow>
            </Pressable>
          )}
          <Actions>
            <Pressable hitSlop={10} onPress={() => toggleFavoriteAbandonment(adopt.id, adopt.isFavorited ?? false)}>
              <AnimatedHeart isLiked={adopt.isFavorited} size={26} inactiveColor={black600.val} />
            </Pressable>
            <Pressable hitSlop={10} onPress={handlePressShare} accessibilityLabel="공유">
              <ShareIcon width={24} height={24} color={black600.val} />
            </Pressable>
          </Actions>
        </ActionRow>

        <YStack px={20} gap={32}>
          {(!!noticePeriod || !!rescuePlace) && (
            <YStack gap={12}>
              <NoticeTitle>공고정보</NoticeTitle>
              <YStack gap={10}>
                {!!noticePeriod && (
                  <NoticeRow>
                    <Clock size={16} color={black600.val as never} />
                    <NoticeLabel>공고기간</NoticeLabel>
                    <NoticeValue>{noticePeriod}</NoticeValue>
                  </NoticeRow>
                )}
                {!!rescuePlace && (
                  <NoticeRow>
                    <MapPin size={16} color={black600.val as never} />
                    <NoticeLabel>구조장소</NoticeLabel>
                    <NoticeValue>{rescuePlace}</NoticeValue>
                  </NoticeRow>
                )}
              </YStack>
            </YStack>
          )}

          <DetailSpecSection title="기본정보" rows={basicRows} />

          <CommunityDetailHealthSection
            neuterYn={adopt.neuterYn}
            vaccinationCheck={adopt.vaccinationCheck ?? ''}
            healthCheck={adopt.healthCheck ?? ''}
            health=""
          />

          <AdoptDetailDescriptionSection specialMark={adopt.specialMark} shelter={shelter} />
        </YStack>
      </ScrollView>

      <BottomButton
        disabled={ctaDisabled}
        onPress={ctaDisabled ? undefined : () => setCallModalOpen((prev) => !prev)}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          setButtonHeight((prev) => (prev === h ? prev : h));
        }}
        topContent={ctaDisabled ? <NoContactText>지금은 문의를 받을 수 없어요</NoContactText> : undefined}
      >
        <Text fontSize={15} fontWeight={600} lineHeight={18} color={ctaDisabled ? '$black500' : '$black900'}>
          보호소에 문의하기
        </Text>
      </BottomButton>

      {canCall && (
        <CallModal
          open={callModalOpen}
          onClose={() => setCallModalOpen(false)}
          tel={shelter?.tel!}
          title={`${shelter?.name}에 문의하기`}
          description="*원활한 소통을 위해 상담원이 상담, 휴대폰 번호, 주소 등을 수집할 수 있습니다"
        />
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

const Hero = styled(View, {
  width: '100%',
  aspectRatio: 4 / 3
});

const ActionRow = styled(XStack, {
  items: 'center',
  justify: 'space-between',
  gap: 12
});

const Actions = styled(XStack, {
  items: 'center',
  gap: 16,
  shrink: 0
});

const ShelterLinkRow = styled(XStack, {
  flex: 1,
  items: 'center',
  gap: 4
});

const ShelterLink = styled(Text, {
  shrink: 1,
  fontSize: 16,
  fontWeight: 700,
  lineHeight: 22,
  color: '$black800'
});

const NoContactText = styled(Text, {
  mb: 8,
  self: 'center',
  fontSize: 13,
  lineHeight: 18,
  fontWeight: 500,
  color: '$black500'
});

const NoticeTitle = styled(Text, {
  fontSize: 18,
  lineHeight: 24,
  fontWeight: 700,
  color: '$black800'
});

const NoticeRow = styled(XStack, {
  items: 'center',
  gap: 8
});

const NoticeLabel = styled(Text, {
  width: 68,
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 22,
  color: '$black600'
});

const NoticeValue = styled(Text, {
  flex: 1,
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 22,
  color: '$black700'
});

const BannerWrap = styled(View, {
  mx: 20,
  mt: 16,
  mb: 20,
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
