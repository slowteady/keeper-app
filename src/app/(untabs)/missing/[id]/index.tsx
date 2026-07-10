import { Clock, Landmark, MapPin } from '@tamagui/lucide-icons';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Suspense, useMemo, useState } from 'react';
import { Pressable, RefreshControl } from 'react-native';
import { ScrollView, styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

import { getMissingContact, mapToMissingDetail, missingQueries } from '@/entities/missing';
import { useLoginRequired } from '@/features/auth';
import { globalToast, SCREEN_GUTTER } from '@/shared/lib';
import { useListRefreshing, useShare } from '@/shared/model';
import { BottomButton, CallModal, Carousel, DetailErrorBoundary, SuspenseFallback } from '@/shared/ui';
import { Share as ShareIcon } from '@/shared/ui/icons/outline';
import { DetailSpecSection } from '@/widgets/adopt-section';

export const ErrorBoundary = DetailErrorBoundary;

const Page = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!id) return null;

  return (
    <Container>
      <Suspense fallback={<SuspenseFallback />}>
        <MissingDetailContent id={id} />
      </Suspense>
    </Container>
  );
};

export default Page;

const MissingDetailContent = ({ id }: { id: string }) => {
  const { black600 } = useTheme();
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callTel, setCallTel] = useState<string | null>(null);
  const [buttonHeight, setButtonHeight] = useState(0);

  const { share } = useShare();
  const { requireLogin } = useLoginRequired();

  const { data, refetch } = useSuspenseQuery(missingQueries.detail(id));
  const { refreshing, handleRefresh } = useListRefreshing(async () => {
    await refetch();
  });
  const missing = useMemo(() => mapToMissingDetail(data), [data]);

  const { mutate: loadContact, isPending } = useMutation({
    mutationFn: () => getMissingContact(id),
    onSuccess: (contact) => {
      setCallTel(contact.callTel);
      setCallModalOpen(true);
    },
    onError: () => globalToast('연락처를 불러오지 못했어요', 'fail')
  });

  const canCall = missing.hasCallTel;

  const handlePressShare = () => {
    share({ type: 'missing', id });
  };

  return (
    <>
      <ScrollView
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 0, paddingBottom: buttonHeight + 40 } as never}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {missing.photos.length > 0 && (
          <Hero mb={16}>
            <Carousel data={missing.photos} showIndicator showImageViewer imageRadius={0} />
          </Hero>
        )}

        <ActionRow px={SCREEN_GUTTER} mb={24}>
          <Pressable hitSlop={10} onPress={handlePressShare} accessibilityLabel="공유">
            <ShareIcon width={22} height={22} color={black600.val} />
          </Pressable>
        </ActionRow>

        <YStack px={SCREEN_GUTTER} gap={32}>
          <YStack gap={12}>
            <InfoTitle>실종 정보</InfoTitle>
            <YStack gap={10}>
              <InfoRow>
                <Clock size={16} color={black600.val as never} />
                <InfoLabel>실종일</InfoLabel>
                <InfoValue>{missing.happenDt}</InfoValue>
              </InfoRow>
              {!!missing.happenPlace && (
                <InfoRow>
                  <MapPin size={16} color={black600.val as never} />
                  <InfoLabel>실종장소</InfoLabel>
                  <InfoValue lineBreakStrategyIOS="hangul-word">{missing.happenPlace}</InfoValue>
                </InfoRow>
              )}
              {!!missing.orgNm && (
                <InfoRow>
                  <Landmark size={16} color={black600.val as never} />
                  <InfoLabel>관할기관</InfoLabel>
                  <InfoValue>{missing.orgNm}</InfoValue>
                </InfoRow>
              )}
            </YStack>
          </YStack>

          <DetailSpecSection title="기본정보" rows={missing.rows} />
        </YStack>
      </ScrollView>

      <BottomButton
        disabled={!canCall || isPending}
        onPress={canCall ? () => requireLogin(() => loadContact()) : undefined}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          setButtonHeight((prev) => (prev === h ? prev : h));
        }}
      >
        <Text fontSize={15} fontWeight={600} lineHeight={18} color={canCall ? '$black900' : '$black500'}>
          보호자에게 전화하기
        </Text>
      </BottomButton>

      {callTel && (
        <CallModal
          open={callModalOpen}
          onClose={() => setCallModalOpen(false)}
          tel={callTel}
          title="보호자에게 전화하기"
          description="*실종 반려동물을 발견하셨다면 보호자에게 연락해 주세요"
        />
      )}
    </>
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
  justify: 'flex-end'
});

const InfoTitle = styled(Text, {
  fontSize: 18,
  lineHeight: 24,
  fontWeight: 700,
  color: '$black800'
});

const InfoRow = styled(XStack, {
  items: 'center',
  gap: 8
});

const InfoLabel = styled(Text, {
  width: 68,
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 22,
  color: '$black600'
});

const InfoValue = styled(Text, {
  flex: 1,
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 22,
  color: '$black700'
});
