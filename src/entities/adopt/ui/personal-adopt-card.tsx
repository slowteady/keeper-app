import { useRecyclingState } from '@shopify/flash-list';
import { Images, MapPin, Play } from '@tamagui/lucide-icons';
import { Image } from 'expo-image';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { styled, Text, View, XStack } from 'tamagui';

import { toggleHaptic } from '@/shared/lib';
import { NoImage } from '@/shared/ui/fallback/no-image';
import { AnimatedHeart } from '@/shared/ui/icons/animation';

import { CORE_CHIP_IDS, PROTECTION_LABEL } from '../constant';
import type { ChipVariant } from '../mapper';
import { AdoptChips } from './adopt-chips';

export type PersonalAdoptCardChip = { id: string; value: string; variant: ChipVariant };

export type PersonalAdoptCardProps = {
  uri: string;
  imageCount?: number;
  title: string;
  intro?: string;
  breed?: string;
  region: string;
  dateText?: string;
  chips?: PersonalAdoptCardChip[];
  protectionType?: string | null;
  isLiked?: boolean;
  onPress?: () => void;
  onPressFavorite?: () => void;
  completed?: boolean;
  compact?: boolean;
  coreChipsOnly?: boolean;
  hasVideo?: boolean;
  videoDuration?: number | null;
};

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const PersonalAdoptCardComponent = ({
  uri,
  imageCount = 0,
  title,
  intro,
  breed,
  region,
  dateText,
  chips,
  protectionType,
  isLiked = false,
  onPress,
  onPressFavorite,
  completed = false,
  compact = false,
  coreChipsOnly = false,
  hasVideo = false,
  videoDuration
}: PersonalAdoptCardProps) => {
  const handlePressFavorite = useCallback(() => {
    if (!onPressFavorite) return;
    toggleHaptic(isLiked);
    onPressFavorite();
  }, [isLiked, onPressFavorite]);

  const badgeLabel = completed ? '입양완료' : protectionType ? PROTECTION_LABEL[protectionType] : undefined;

  const displayChips = (() => {
    const base = chips ?? [];
    if (coreChipsOnly) return base.filter((c) => CORE_CHIP_IDS.includes(c.id));
    if (!compact || !breed) return base;
    const breedChip = { id: 'BREED', value: breed, variant: 'default' as ChipVariant };
    return base.length > 0 ? [base[0], breedChip, ...base.slice(1)] : [breedChip];
  })();

  return (
    <Container>
      <Pressable onPress={onPress} disabled={!onPress}>
        <ImageContainer compact={compact}>
          <ImageWithSkeleton uri={uri} compact={compact} />
          {completed && <CompletedDim />}
          {badgeLabel && (
            <ProtectionBadge>
              <ProtectionText>{badgeLabel}</ProtectionText>
            </ProtectionBadge>
          )}
          {hasVideo ? (
            <MediaBadge>
              <Play size={11} color="#fff" fill="#fff" />
              {!!videoDuration && <MediaBadgeText>{formatDuration(videoDuration)}</MediaBadgeText>}
            </MediaBadge>
          ) : (
            imageCount > 1 && (
              <MediaBadge>
                <Images size={12} color="#fff" />
                <MediaBadgeText>{imageCount}</MediaBadgeText>
              </MediaBadge>
            )
          )}
        </ImageContainer>

        <TitleRow compact={compact}>
          <Title compact={compact} numberOfLines={compact ? 1 : 2}>
            {title}
          </Title>
          {!compact && !!dateText && <DateText>{dateText}</DateText>}
        </TitleRow>
        {!compact && !!intro && <IntroText>{intro}</IntroText>}
        {compact
          ? !!region && (
              <RegionLine>
                <MapPin size={13} color="$black500" />
                <RegionText>{region}</RegionText>
              </RegionLine>
            )
          : (!!breed || !!region) && (
              <MetaRows compact={compact}>
                {!!breed && (
                  <MetaRow>
                    <MetaLabel compact={compact}>품종</MetaLabel>
                    <MetaValue compact={compact}>{breed}</MetaValue>
                  </MetaRow>
                )}
                {!!region && (
                  <MetaRow>
                    <MetaLabel compact={compact}>장소</MetaLabel>
                    <MetaValue compact={compact}>{region}</MetaValue>
                  </MetaRow>
                )}
              </MetaRows>
            )}
        {displayChips.length > 0 && <AdoptChips chips={displayChips} />}
      </Pressable>

      {onPressFavorite && (
        <Pressable
          style={compact ? styles.favoriteButtonCompact : styles.favoriteButton}
          hitSlop={10}
          onPress={handlePressFavorite}
        >
          <AnimatedHeart isLiked={isLiked} size={compact ? 18 : 20} strokeWidth={2} inactiveColor="#FFFFFF" />
        </Pressable>
      )}
    </Container>
  );
};

export const PersonalAdoptCard = memo(PersonalAdoptCardComponent);
PersonalAdoptCard.displayName = 'PersonalAdoptCard';

const ImageWithSkeleton = ({ uri, compact }: { uri: string; compact?: boolean }) => {
  const [errored, setErrored] = useRecyclingState(false, [uri]);

  if (!uri || errored) {
    return <NoImage />;
  }

  return (
    <Image
      source={{ uri }}
      recyclingKey={uri}
      cachePolicy="memory-disk"
      transition={0}
      contentFit="cover"
      onError={() => setErrored(true)}
      style={[styles.image, compact && styles.imageCompact]}
    />
  );
};

const CompletedDim = () => (
  <View position="absolute" t={0} l={0} r={0} b={0} rounded={12} bg="$black900" opacity={0.45} />
);

const Container = styled(View, {
  width: '100%'
});

const ImageContainer = styled(View, {
  width: '100%',
  aspectRatio: 4 / 3,
  mb: 18,
  variants: {
    compact: {
      true: { aspectRatio: 5 / 4, mb: 18 }
    }
  } as const
});

const ProtectionBadge = styled(View, {
  position: 'absolute',
  t: 10,
  l: 10,
  px: 8,
  py: 4,
  rounded: 999,
  bg: 'rgba(255,255,255,0.92)'
});

const ProtectionText = styled(Text, {
  fontWeight: 700,
  fontSize: 12,
  lineHeight: 14,
  color: '$black800'
});

const MediaBadge = styled(XStack, {
  position: 'absolute',
  b: 10,
  r: 10,
  items: 'center',
  gap: 3,
  px: 8,
  py: 4,
  rounded: 999,
  bg: 'rgba(0,0,0,0.55)'
});

const MediaBadgeText = styled(Text, {
  fontWeight: 600,
  fontSize: 12,
  lineHeight: 14,
  color: '#fff'
});

const TitleRow = styled(XStack, {
  items: 'flex-start',
  justify: 'space-between',
  gap: 12,
  mb: 14,
  variants: {
    compact: {
      true: { mb: 16 }
    }
  } as const
});

const Title = styled(Text, {
  flex: 1,
  fontWeight: 600,
  fontSize: 17,
  lineHeight: 26,
  color: '$black900',
  numberOfLines: 2,
  ellipsizeMode: 'tail',
  variants: {
    compact: {
      true: { fontSize: 18, lineHeight: 22 }
    }
  } as const
});

const RegionLine = styled(XStack, {
  items: 'center',
  gap: 4,
  mb: 14
});

const RegionText = styled(Text, {
  shrink: 1,
  fontWeight: 500,
  fontSize: 14,
  lineHeight: 17,
  color: '$black500',
  numberOfLines: 1,
  ellipsizeMode: 'tail'
});

const IntroText = styled(Text, {
  fontWeight: 400,
  fontSize: 14,
  lineHeight: 22,
  color: '$black600',
  numberOfLines: 2,
  ellipsizeMode: 'tail',
  mb: 14
});

const MetaRows = styled(View, {
  gap: 10,
  mb: 14,
  variants: {
    compact: {
      true: { gap: 10, mb: 16 }
    }
  } as const
});

const MetaRow = styled(XStack, {
  items: 'center'
});

const MetaLabel = styled(Text, {
  minW: 57,
  shrink: 0,
  fontWeight: 500,
  fontSize: 13,
  lineHeight: 15,
  color: '$black600',
  variants: {
    compact: {
      true: { fontSize: 15, lineHeight: 17 }
    }
  } as const
});

const MetaValue = styled(Text, {
  flex: 1,
  fontWeight: 500,
  fontSize: 13,
  lineHeight: 15,
  color: '$black700',
  numberOfLines: 1,
  ellipsizeMode: 'tail',
  variants: {
    compact: {
      true: { fontSize: 15, lineHeight: 17 }
    }
  } as const
});

const DateText = styled(Text, {
  mt: 3,
  fontWeight: 500,
  fontSize: 12,
  lineHeight: 16,
  color: '$black400'
});

const styles = StyleSheet.create({
  image: {
    width: '100%',
    borderRadius: 12,
    aspectRatio: 4 / 3,
    backgroundColor: '#F2F3F5'
  },
  imageCompact: {
    aspectRatio: 5 / 4
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  favoriteButtonCompact: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
