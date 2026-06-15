import { useCallback, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { styled, Text, View, YStack } from 'tamagui';

import { useCurrentUser, useLoginRequired } from '@/features/auth';
import { useLikePost } from '@/features/like-post';
import { useLayout } from '@/shared/model';
import { BottomButton, Skeleton, useBottomSheet } from '@/shared/ui';
import { AdoptBasicInfoGrid } from '@/widgets/adopt-section';
import {
  CommunityDetailBehaviorSection,
  CommunityDetailDescriptionSection,
  CommunityDetailHealthSection,
  CommunityDetailOverviewSection
} from '@/widgets/community-adopt-feed-section';

import { useAdoptionStatus } from '../model/use-adoption-status';
import { useCommunityAdoptDetailFeed } from '../model/use-community-adopt-detail-feed';
import { usePostMenu } from '../model/use-post-menu';
import { ContactSheet } from './contact-sheet';

export type CommunityAdoptDetailContentProps = {
  id: string;
};

// 개인 공고 상세 — 공고이므로 공개 댓글 없이 정보 + 하단 문의/입양완료 CTA (보호소 상세와 정합).
export const CommunityAdoptDetailContent = ({ id }: CommunityAdoptDetailContentProps) => {
  const [buttonHeight, setButtonHeight] = useState(0);
  const { present, dismiss } = useBottomSheet();
  const { bottom } = useLayout();

  const { data } = useCommunityAdoptDetailFeed(id);
  const { toggleLikePost } = useLikePost();

  const detailPost = data.detailPost;
  const infos = data.infos as {
    age: string;
    gender: string;
    weight: string;
    healthCheck?: string;
    neuterYn?: string;
    vaccinationCheck?: string;
  };
  const descriptions = data.descriptions as { health: string; relatedLink: string };
  const behaviors = data.behaviors as { label: string; value: string }[];
  const healthText = descriptions?.health ?? '';
  const hasRelatedLink = !!descriptions?.relatedLink?.trim();
  const isLiked = detailPost?.isLiked ?? false;
  const authorId = detailPost?.user?.id ?? null;
  const contacts = (detailPost?.contacts ?? []).filter((c) => c.value && c.value.length > 0);
  const hasContact = contacts.length > 0;

  const { user, isLoading: isUserLoading } = useCurrentUser();
  const isOwner = !!user && !!authorId && user.id === authorId;
  const isCompleted = detailPost?.adoptionStatus === 'COMPLETED';
  const { setCompleted, setInProgress, isPending: isStatusPending } = useAdoptionStatus(id);
  const { requireLogin } = useLoginRequired();

  const { openPostMenu, sharePost } = usePostMenu({ postId: id, authorId });

  const openContactSheet = useCallback(() => {
    requireLogin(() => {
      present(<ContactSheet contacts={contacts} />, { enableDynamicSizing: true, onDismiss: dismiss });
    });
  }, [requireLogin, present, dismiss, contacts]);

  const handleToggleStatus = useCallback(() => {
    Alert.alert(
      isCompleted ? '입양중으로 변경할까요?' : '입양완료로 변경할까요?',
      isCompleted ? '다시 입양 공고로 노출돼요.' : '입양 목록에서 완료로 표시되고 하단으로 내려가요.',
      [
        { text: '취소', style: 'cancel' },
        { text: '변경', onPress: () => (isCompleted ? setInProgress() : setCompleted()) }
      ]
    );
  }, [isCompleted, setInProgress, setCompleted]);

  const handleLayout = useCallback((h: number) => setButtonHeight((prev) => (prev === h ? prev : h)), []);

  // 하단 CTA: 소유자=입양완료 처리(토글) / 비소유자=문의하기(연락처 있고 입양중일 때). user 미확정 동안 스켈레톤.
  const showOwnerCta = !isUserLoading && isOwner;
  const showContactCta = !isUserLoading && !isOwner && hasContact && !isCompleted;
  const hasBottomCta = isUserLoading || showOwnerCta || showContactCta;

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 32, paddingBottom: hasBottomCta ? buttonHeight + 40 : 48 }}
      >
        {isCompleted && (
          <CompletedBanner>
            <CompletedLabel>입양완료</CompletedLabel>
            <CompletedText>이 친구는 새로운 가족을 만났어요</CompletedText>
          </CompletedBanner>
        )}

        {detailPost && (
          <View px={20} mb={32}>
            <CommunityDetailOverviewSection
              {...(data.overviews as Parameters<typeof CommunityDetailOverviewSection>[0])}
              onPressLike={() => toggleLikePost(id, isLiked)}
              onPressShare={sharePost}
              onPressMore={openPostMenu}
            />
          </View>
        )}

        <Divider mb={32} />

        {detailPost && (
          <>
            <YStack px={20} mb={32}>
              <AdoptBasicInfoGrid age={infos.age} gender={infos.gender} weight={infos.weight} />
            </YStack>
            {behaviors.length > 0 && (
              <View px={20} mb={32}>
                <CommunityDetailBehaviorSection items={behaviors} />
              </View>
            )}
            <View px={20} mb={32}>
              <CommunityDetailHealthSection
                neuterYn={infos.neuterYn}
                vaccinationCheck={infos.vaccinationCheck}
                healthCheck={infos.healthCheck}
                health={healthText}
              />
            </View>
            {hasRelatedLink && (
              <View px={20} mb={32}>
                <CommunityDetailDescriptionSection relatedLink={descriptions.relatedLink} />
              </View>
            )}
          </>
        )}
      </ScrollView>

      {isUserLoading ? (
        <SkeletonBar pb={bottom}>
          <Skeleton style={{ height: 52, borderRadius: 10 }} />
        </SkeletonBar>
      ) : showOwnerCta ? (
        <BottomButton
          onPress={handleToggleStatus}
          isLoading={isStatusPending}
          onLayout={(e) => handleLayout(e.nativeEvent.layout.height)}
        >
          <Text fontSize={15} fontWeight={600} lineHeight={18} color="$black900">
            {isCompleted ? '입양중으로 변경' : '입양완료 처리'}
          </Text>
        </BottomButton>
      ) : showContactCta ? (
        <BottomButton onPress={openContactSheet} onLayout={(e) => handleLayout(e.nativeEvent.layout.height)}>
          <Text fontSize={15} fontWeight={600} lineHeight={18} color="$black900">
            문의하기
          </Text>
        </BottomButton>
      ) : null}
    </>
  );
};

const Divider = styled(View, {
  height: 8,
  bg: '$white850'
});

const CompletedBanner = styled(View, {
  mx: 20,
  mb: 24,
  px: 16,
  py: 14,
  rounded: 10,
  bg: '$successLightest'
});

const CompletedLabel = styled(Text, {
  fontWeight: 700,
  fontSize: 13,
  lineHeight: 15,
  mb: 4,
  color: '$successMain'
});

const CompletedText = styled(Text, {
  fontWeight: 500,
  fontSize: 15,
  lineHeight: 20,
  color: '$black900'
});

const SkeletonBar = styled(View, {
  position: 'absolute',
  l: 0,
  r: 0,
  b: 0,
  px: 20,
  pt: 10,
  bg: '$white900'
});
