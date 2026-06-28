import { MoreVertical } from '@tamagui/lucide-icons';
import { useCallback } from 'react';
import { Pressable } from 'react-native';
import { styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

import { formatTimeAgo } from '@/shared/lib';
import { AnimatedHeart } from '@/shared/ui/icons/animation';

import { CommunityAdoptListDto } from '../schema';
import { CategoryChip, CategoryText, DisplayTime, Thumbnail } from './post-list-styles';

export type CommunityPostListItemStatus = {
  label: string;
  tone: 'notice' | 'success';
};

export type CommunityPostListItemProps = {
  data: CommunityAdoptListDto;
  categoryLabel: string;
  status?: CommunityPostListItemStatus;
  onPress: (id: string) => void;
  onPressLike?: (id: string, currentlyLiked: boolean) => void;
  onPressMore?: () => void;
  hideCategory?: boolean;
  hideLikeCount?: boolean;
};

export const CommunityPostListItem = ({
  data,
  categoryLabel,
  status,
  onPress,
  onPressLike,
  onPressMore,
  hideCategory = false,
  hideLikeCount = false
}: CommunityPostListItemProps) => {
  const { black500 } = useTheme();
  const thumbnail = data.images?.[0];

  const handlePressLike = useCallback(() => {
    if (!onPressLike) return;
    onPressLike(data.id, data.isLiked);
  }, [data.id, data.isLiked, onPressLike]);

  return (
    <Container>
      <Pressable onPress={() => onPress(data.id)} style={{ flex: 1 }}>
        <YStack gap={8}>
          <XStack items="center" gap={8}>
            {status && (
              <StatusChip tone={status.tone}>
                <StatusText tone={status.tone}>{status.label}</StatusText>
              </StatusChip>
            )}
            {!hideCategory && (
              <CategoryChip>
                <CategoryText>{categoryLabel}</CategoryText>
              </CategoryChip>
            )}
            <DisplayTime>{formatTimeAgo(data.displayTime)}</DisplayTime>
          </XStack>
          <Preview numberOfLines={2} ellipsizeMode="tail">
            {data.title}
          </Preview>
          {(onPressLike || (!hideLikeCount && data.counts.like > 0)) && (
            <XStack items="center" gap={10}>
              {onPressLike && (
                <Pressable onPress={handlePressLike} hitSlop={8} testID={`me-liked-post-toggle-${data.id}`}>
                  <AnimatedHeart isLiked={data.isLiked} size={18} inactiveColor={black500.val} />
                </Pressable>
              )}
              {!hideLikeCount && data.counts.like > 0 && <Meta>{data.counts.like}명이 공감했어요</Meta>}
            </XStack>
          )}
        </YStack>
      </Pressable>
      {(onPressMore || thumbnail) && (
        <RightColumn>
          {onPressMore ? (
            <Pressable
              onPress={onPressMore}
              hitSlop={10}
              accessibilityLabel="더보기"
              testID={`my-post-more-${data.id}`}
            >
              <MoreVertical size={18} color="$black700" />
            </Pressable>
          ) : null}
          {thumbnail && <Thumbnail source={{ uri: thumbnail }} contentFit="cover" />}
        </RightColumn>
      )}
    </Container>
  );
};

const RightColumn = styled(YStack, {
  items: 'flex-end',
  gap: 10
});

const Container = styled(XStack, {
  py: 16,
  gap: 16,
  borderBottomWidth: 1,
  borderBottomColor: '$white850',
  items: 'flex-start'
});

const StatusChip = styled(View, {
  px: 6,
  py: 5,
  rounded: 4,
  variants: {
    tone: {
      notice: { bg: '$noticeLightest' },
      success: { bg: '$successLightest' }
    }
  } as const
});

const StatusText = styled(Text, {
  fontSize: 12,
  fontWeight: '600',
  letterSpacing: -0.24,
  variants: {
    tone: {
      notice: { color: '$noticeMain' },
      success: { color: '$successMain' }
    }
  } as const
});

const Preview = styled(Text, {
  fontSize: 15,
  fontWeight: '600',
  lineHeight: 22,
  color: '$black900',
  letterSpacing: -0.45
});

const Meta = styled(Text, {
  fontSize: 11,
  fontWeight: '500',
  color: '$black500',
  letterSpacing: -0.22
});
