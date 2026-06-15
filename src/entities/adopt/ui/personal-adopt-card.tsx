import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { styled, Text, useTheme, View, XStack } from 'tamagui';

import { toggleHaptic } from '@/shared/lib';
import { Skeleton } from '@/shared/ui';
import { NoImage } from '@/shared/ui/fallback/no-image';
import { AnimatedHeart } from '@/shared/ui/icons/animation';
import { Location } from '@/shared/ui/icons/outline';

import type { ChipVariant } from '../mapper';

const PROTECTION_LABEL: Record<string, string> = {
  ADOPTION: '입양',
  TEMPORARY: '임시보호',
  BOTH: '입양·임보'
};

export type PersonalAdoptCardChip = { id: string; value: string; variant: ChipVariant };

export type PersonalAdoptCardProps = {
  uri: string;
  title: string;
  intro?: string;
  animalLabel: string;
  animalVariant: ChipVariant;
  region: string;
  dateText: string;
  chips?: PersonalAdoptCardChip[];
  protectionType?: string | null;
  isLiked?: boolean;
  onPress?: () => void;
  onPressFavorite?: () => void;
  completed?: boolean;
};

export const PersonalAdoptCard = ({
  uri,
  title,
  intro,
  animalLabel,
  animalVariant,
  region,
  dateText,
  chips,
  protectionType,
  isLiked = false,
  onPress,
  onPressFavorite,
  completed = false
}: PersonalAdoptCardProps) => {
  const { black400 } = useTheme();
  const handlePressFavorite = useCallback(() => {
    if (!onPressFavorite) return;
    toggleHaptic(isLiked);
    onPressFavorite();
  }, [isLiked, onPressFavorite]);

  const badgeLabel = completed ? '입양완료' : protectionType ? PROTECTION_LABEL[protectionType] : undefined;

  return (
    <Container>
      <Pressable onPress={onPress} disabled={!onPress}>
        <ImageContainer>
          <ImageWithSkeleton key={uri} uri={uri} />
          {completed && <CompletedDim />}
          {badgeLabel && (
            <ProtectionBadge>
              <ProtectionText>{badgeLabel}</ProtectionText>
            </ProtectionBadge>
          )}
        </ImageContainer>

        <AnimalLabel variant={animalVariant}>{animalLabel}</AnimalLabel>
        <TitleRow>
          <Title>{title}</Title>
          {!!dateText && <DateText>{dateText}</DateText>}
        </TitleRow>
        {!!intro && <IntroText>{intro}</IntroText>}
        {!!region && (
          <RegionWrap>
            <Location width={14} height={14} color={black400.val} />
            <RegionText>{region}</RegionText>
          </RegionWrap>
        )}
        {!!chips?.length && (
          <ChipRow>
            {chips.map(({ id, value, variant }) => (
              <ChipItem key={id} variant={variant}>
                <ChipText variant={variant}>{value}</ChipText>
              </ChipItem>
            ))}
          </ChipRow>
        )}
      </Pressable>

      {onPressFavorite && (
        <Pressable style={styles.favoriteButton} hitSlop={10} onPress={handlePressFavorite}>
          <AnimatedHeart isLiked={isLiked} size={20} strokeWidth={2} inactiveColor="#FFFFFF" />
        </Pressable>
      )}
    </Container>
  );
};

type ImageStatus = 'loading' | 'loaded' | 'error';

const ImageWithSkeleton = ({ uri }: { uri: string }) => {
  const [status, setStatus] = useState<ImageStatus>('loading');

  const handleLoad = useCallback(() => setStatus('loaded'), []);
  const handleError = useCallback(() => setStatus('error'), []);

  if (!uri || status === 'error') {
    return <NoImage />;
  }

  return (
    <>
      {status === 'loading' && (
        <Skeleton style={{ position: 'absolute', top: 0, width: '100%', height: '100%', borderRadius: 12 }} />
      )}
      <Image source={{ uri }} onLoad={handleLoad} onError={handleError} style={styles.image} />
    </>
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
  mb: 14
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

const AnimalLabel = styled(Text, {
  fontWeight: 700,
  fontSize: 12,
  lineHeight: 15,
  mb: 4,
  variants: {
    variant: {
      dog: { color: '$dogMain' },
      cat: { color: '$catMain' },
      etc: { color: '$etcMain' },
      default: { color: '$black600' },
      error: { color: '$errorMain' },
      success: { color: '$successMain' },
      notice: { color: '$noticeMain' }
    }
  } as const
});

const TitleRow = styled(XStack, {
  items: 'flex-start',
  gap: 8,
  mb: 6
});

const Title = styled(Text, {
  flex: 1,
  fontWeight: 600,
  fontSize: 17,
  lineHeight: 22,
  color: '$black900',
  numberOfLines: 2,
  ellipsizeMode: 'tail'
});

const IntroText = styled(Text, {
  fontWeight: 400,
  fontSize: 14,
  lineHeight: 19,
  color: '$black600',
  numberOfLines: 1,
  ellipsizeMode: 'tail',
  mb: 8
});

const ChipRow = styled(XStack, {
  flexWrap: 'wrap',
  gap: 4
});

const ChipItem = styled(View, {
  self: 'baseline',
  rounded: 4,
  px: 6,
  py: 4,
  variants: {
    variant: {
      error: { backgroundColor: '$errorLightest' },
      success: { backgroundColor: '$successLightest' },
      notice: { backgroundColor: '$noticeLightest' },
      default: { backgroundColor: '$backgroundDefault' },
      dog: { backgroundColor: '$dogLightest' },
      cat: { backgroundColor: '$catLightest' },
      etc: { backgroundColor: '$etcLightest' }
    }
  } as const
});

const ChipText = styled(Text, {
  fontWeight: 400,
  fontSize: 12,
  lineHeight: 14,
  variants: {
    variant: {
      error: { color: '$errorMain' },
      success: { color: '$successMain' },
      notice: { color: '$noticeMain' },
      default: { color: '$black600' },
      dog: { color: '$dogMain' },
      cat: { color: '$catMain' },
      etc: { color: '$etcMain' }
    }
  } as const
});

const RegionWrap = styled(XStack, {
  items: 'center',
  gap: 3,
  mb: 10
});

const RegionText = styled(Text, {
  flex: 1,
  fontWeight: 500,
  fontSize: 13,
  lineHeight: 16,
  color: '$black500',
  numberOfLines: 1,
  ellipsizeMode: 'tail'
});

const DateText = styled(Text, {
  mt: 2,
  fontWeight: 500,
  fontSize: 12,
  lineHeight: 16,
  color: '$black400'
});

const styles = StyleSheet.create({
  image: {
    width: '100%',
    borderRadius: 12,
    aspectRatio: 4 / 3
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
  }
});
