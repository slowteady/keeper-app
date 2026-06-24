import { MoreVertical, Siren } from '@tamagui/lucide-icons';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView } from 'react-native';
import { styled, Text, useTheme, View, XStack } from 'tamagui';

import { PROTECTION_LABEL } from '@/entities/adopt';
import { PostCardHeader, PostCardTitle } from '@/entities/community';
import { useCurrentUser, useLoginRequired } from '@/features/auth';
import { useLikePost } from '@/features/like-post';
import { toggleHaptic } from '@/shared/lib';
import { useLayout } from '@/shared/model';
import { BottomButton, Carousel, ConfirmModal, Skeleton, useBottomSheet, useModal } from '@/shared/ui';
import { AnimatedHeart } from '@/shared/ui/icons/animation';
import { Share as ShareIcon } from '@/shared/ui/icons/outline';
import { DetailSpecSection } from '@/widgets/adopt-section';
import {
  CommunityDetailBehaviorSection,
  CommunityDetailDescriptionSection,
  CommunityDetailHealthSection
} from '@/widgets/community-post-section';

import { useAdoptionStatus } from '../model/use-adoption-status';
import { useCommunityAdoptDetailFeed } from '../model/use-community-adopt-detail-feed';
import { usePostMenu } from '../model/use-post-menu';
import { ContactSheet } from './contact-sheet';

export type CommunityAdoptDetailContentProps = {
  id: string;
};

export const CommunityAdoptDetailContent = ({ id }: CommunityAdoptDetailContentProps) => {
  const [buttonHeight, setButtonHeight] = useState(0);
  const { present, dismiss } = useBottomSheet();
  const { open: openModal, close: closeModal } = useModal();
  const { bottom } = useLayout();

  const { data, hasContact, getContacts, refetch, isRefetching } = useCommunityAdoptDetailFeed(id);
  const { toggleLikePost } = useLikePost();
  const { black600 } = useTheme();

  const { detailPost, overviews, infos, descriptions, behaviors } = data;
  const healthText = descriptions?.health ?? '';
  const hasRelatedLink = !!descriptions?.relatedLink?.trim();
  const isLiked = detailPost?.isLiked ?? false;
  const authorId = detailPost?.user?.id ?? null;

  const { user, isLoading: isUserLoading } = useCurrentUser();
  const isOwner = !!user && !!authorId && user.id === authorId;
  const isCompleted = detailPost?.adoptionStatus === 'COMPLETED';
  const badgeLabel = overviews?.protectionType ? PROTECTION_LABEL[overviews.protectionType] : undefined;
  const { setCompleted, setInProgress, isPending: isStatusPending } = useAdoptionStatus(id);
  const { requireLogin } = useLoginRequired();

  const { openPostMenu, sharePost, reportPost } = usePostMenu({ postId: id, authorId, hideBlock: true });

  const openContactSheet = useCallback(() => {
    requireLogin(async () => {
      const contacts = await getContacts();
      present(<ContactSheet contacts={contacts} />, { enableDynamicSizing: true, onDismiss: dismiss });
    });
  }, [requireLogin, present, dismiss, getContacts]);

  const handleToggleStatus = useCallback(() => {
    openModal(
      <ConfirmModal
        title={isCompleted ? '입양중으로 변경할까요?' : '입양완료로 변경할까요?'}
        description={
          isCompleted
            ? '공고가 입양중으로 처리돼요. 다시 변경할 수 있어요'
            : '공고가 입양완료로 처리돼요. 다시 변경할 수 있어요'
        }
        confirmText="변경"
        cancelText="취소"
        onCancel={closeModal}
        onConfirm={() => {
          closeModal();
          if (isCompleted) setInProgress();
          else setCompleted();
        }}
      />
    );
  }, [openModal, closeModal, isCompleted, setInProgress, setCompleted]);

  const handlePressLike = useCallback(() => {
    toggleHaptic(isLiked);
    toggleLikePost(id, isLiked);
  }, [toggleLikePost, id, isLiked]);

  const handleLayout = useCallback((h: number) => setButtonHeight((prev) => (prev === h ? prev : h)), []);

  const showOwnerCta = !isUserLoading && isOwner;
  const showContactCta = !isUserLoading && !isOwner && hasContact && !isCompleted;
  const hasBottomCta = isUserLoading || showOwnerCta || showContactCta;

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 0, paddingBottom: hasBottomCta ? buttonHeight + 40 : 48 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
      >
        {isCompleted && (
          <CompletedBanner>
            <CompletedLabel>입양완료</CompletedLabel>
            <CompletedText>이 친구는 새로운 가족을 만났어요</CompletedText>
          </CompletedBanner>
        )}

        {detailPost && overviews && infos && descriptions && (
          <>
            {overviews.images.length > 0 && (
              <Hero mb={16}>
                <Carousel data={overviews.images} showIndicator showImageViewer imageRadius={0} />
              </Hero>
            )}

            <View px={20} mb={28}>
              <AuthorRow mb={16}>
                <PostCardHeader
                  image={overviews.image}
                  nickname={overviews.nickname}
                  displayTime={overviews.displayTime}
                />
                <Actions>
                  <Pressable onPress={handlePressLike} hitSlop={10} testID="community-detail-heart">
                    <AnimatedHeart size={26} isLiked={isLiked} inactiveColor={black600.val} />
                  </Pressable>
                  <Pressable
                    onPress={sharePost}
                    hitSlop={10}
                    accessibilityLabel="공유하기"
                    testID="community-detail-share"
                  >
                    <ShareIcon width={24} height={24} color={black600.val} />
                  </Pressable>
                  {isOwner ? (
                    <Pressable
                      onPress={openPostMenu}
                      hitSlop={10}
                      accessibilityLabel="더보기"
                      testID="community-detail-more"
                    >
                      <MoreVertical size={22} color="$black600" />
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={reportPost}
                      hitSlop={10}
                      accessibilityLabel="신고하기"
                      testID="community-detail-report"
                    >
                      <Siren size={22} color="$black600" />
                    </Pressable>
                  )}
                </Actions>
              </AuthorRow>
              {!isCompleted && badgeLabel && (
                <ProtectionChip>
                  <ProtectionChipText>{badgeLabel}</ProtectionChipText>
                </ProtectionChip>
              )}
              <PostCardTitle title={overviews.title} numberOfLines={2} mb={overviews.content ? 12 : 0} />
              {!!overviews.content && <IntroBody>{overviews.content}</IntroBody>}
            </View>

            <Divider mb={32} />

            <View px={20} mb={32}>
              <DetailSpecSection
                title="기본정보"
                rows={[
                  { label: '품종', value: overviews.breed },
                  ...(overviews.region ? [{ label: '지역', value: overviews.region }] : []),
                  { label: '나이', value: infos.age },
                  { label: '성별', value: infos.gender },
                  { label: '크기·몸무게', value: infos.weight }
                ].filter((r) => !!r.value && r.value !== '모름' && r.value !== '미상')}
              />
            </View>
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

const ProtectionChip = styled(View, {
  self: 'flex-start',
  mb: 12,
  px: 10,
  py: 5,
  rounded: 999,
  bg: '$backgroundDefault'
});

const ProtectionChipText = styled(Text, {
  fontWeight: 600,
  fontSize: 13,
  lineHeight: 15,
  color: '$black700'
});

const IntroBody = styled(Text, {
  fontSize: 15,
  lineHeight: 24,
  fontWeight: 400,
  color: '$black800'
});

const Hero = styled(View, {
  width: '100%',
  aspectRatio: 4 / 3
});

const AuthorRow = styled(XStack, {
  items: 'center',
  justify: 'space-between',
  gap: 12
});

const Actions = styled(XStack, {
  items: 'center',
  gap: 16
});

const Divider = styled(View, {
  height: 8,
  bg: '$white850'
});

const CompletedBanner = styled(View, {
  mx: 20,
  mt: 16,
  mb: 20,
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
