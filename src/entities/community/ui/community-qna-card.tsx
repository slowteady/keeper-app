import { Play } from '@tamagui/lucide-icons';
import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { Pressable } from 'react-native';
import { styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

import { ProfileAvatar } from '@/entities/profile';
import { formatTimeAgo, toggleHaptic } from '@/shared/lib';
import { Skeleton } from '@/shared/ui';
import { AnimatedHeart } from '@/shared/ui/icons/animation';

import { CommunityQnaListItemDto } from '../schema';
import { PostStats } from './post-stats';

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export type CommunityQnaCardProps = {
  data: CommunityQnaListItemDto;
  categoryLabel: string;
  onPress: (id: string) => void;
  onPressLike?: (id: string, isLiked: boolean) => void;
};

export const CommunityQnaCard = ({ data, categoryLabel, onPress, onPressLike }: CommunityQnaCardProps) => {
  const { black500 } = useTheme();
  const hasVideo = !!data.videoThumbnailUrl;
  const thumbnail = hasVideo ? data.videoThumbnailUrl : data.images?.[0];

  const handlePressLike = useCallback(() => {
    if (!onPressLike) return;
    toggleHaptic(data.isLiked);
    onPressLike(data.id, data.isLiked);
  }, [data.id, data.isLiked, onPressLike]);

  return (
    <Container>
      <Pressable onPress={() => onPress(data.id)} style={{ flex: 1 }}>
        <Body>
          <XStack items="center" gap={6}>
            <ProfileAvatar image={data.user?.image ?? ''} size={20} shape="rounded" />
            <Writer numberOfLines={1} style={{ flexShrink: 1 }}>
              {data.user?.nickname ?? '탈퇴한 사용자'}
            </Writer>
            <DisplayTime>· {formatTimeAgo(data.displayTime)}</DisplayTime>
          </XStack>
          <XStack items="center" gap={6}>
            <CategoryChip>
              <CategoryText>{categoryLabel}</CategoryText>
            </CategoryChip>
            <Title flex={1} numberOfLines={1} ellipsizeMode="tail">
              {data.title}
            </Title>
          </XStack>
          <Preview numberOfLines={2} ellipsizeMode="tail">
            {data.content ?? ''}
          </Preview>
          <PostStats comment={data.counts.comment} like={data.counts.like} view={data.counts.view} />
        </Body>
      </Pressable>

      <Right>
        {onPressLike && (
          <Pressable onPress={handlePressLike} hitSlop={8} testID={`qna-card-heart-${data.id}`}>
            <AnimatedHeart isLiked={data.isLiked} size={20} inactiveColor={black500.val} />
          </Pressable>
        )}
        {thumbnail ? <CardThumbnail uri={thumbnail} hasVideo={hasVideo} videoDuration={data.videoDuration} /> : null}
      </Right>
    </Container>
  );
};

const Container = styled(XStack, {
  py: 16,
  gap: 12
});

const Body = styled(YStack, {
  flex: 1,
  gap: 10
});

const Right = styled(YStack, {
  items: 'flex-end',
  gap: 8
});

const CategoryChip = styled(View, {
  px: 8,
  py: 4,
  rounded: 6,
  bg: '$white850'
});

const CategoryText = styled(Text, {
  fontSize: 11,
  color: '$primaryMain',
  fontWeight: '600'
});

const Writer = styled(Text, {
  fontSize: 13,
  color: '$black700',
  fontWeight: '500'
});

const DisplayTime = styled(Text, {
  fontSize: 12,
  color: '$black500'
});

const Title = styled(Text, {
  fontSize: 16,
  color: '$black900',
  fontWeight: '600'
});

const Preview = styled(Text, {
  fontSize: 13,
  color: '$black500',
  lineHeight: 18
});

const CardThumbnail = ({
  uri,
  hasVideo = false,
  videoDuration
}: {
  uri: string;
  hasVideo?: boolean;
  videoDuration?: number | null;
}) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <ThumbnailBox>
      {!loaded && <Skeleton style={{ position: 'absolute', width: 72, height: 72, borderRadius: 8 }} />}
      <Thumbnail source={{ uri }} contentFit="cover" onLoad={() => setLoaded(true)} />
      {hasVideo && (
        <VideoBadge>
          <Play size={9} color="#fff" fill="#fff" />
          {!!videoDuration && <VideoBadgeText>{formatDuration(videoDuration)}</VideoBadgeText>}
        </VideoBadge>
      )}
    </ThumbnailBox>
  );
};

const ThumbnailBox = styled(View, {
  width: 72,
  height: 72,
  rounded: 8,
  overflow: 'hidden'
});

const VideoBadge = styled(XStack, {
  position: 'absolute',
  b: 4,
  r: 4,
  items: 'center',
  gap: 2,
  px: 5,
  py: 2,
  rounded: 999,
  bg: 'rgba(0,0,0,0.55)'
});

const VideoBadgeText = styled(Text, {
  fontWeight: 600,
  fontSize: 10,
  lineHeight: 12,
  color: '#fff'
});

const Thumbnail = styled(Image, {
  width: 72,
  height: 72,
  rounded: 8
});
