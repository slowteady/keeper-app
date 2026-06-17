import { useRecyclingState } from '@shopify/flash-list';
import { Images } from '@tamagui/lucide-icons';
import { Image } from 'expo-image';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { styled, Text, View, XStack } from 'tamagui';

import { toggleHaptic } from '@/shared/lib';
import { NoImage } from '@/shared/ui/fallback/no-image';
import { AnimatedHeart } from '@/shared/ui/icons/animation';

import { PROTECTION_LABEL } from '../constant';
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
  dateText: string;
  chips?: PersonalAdoptCardChip[];
  protectionType?: string | null;
  isLiked?: boolean;
  onPress?: () => void;
  onPressFavorite?: () => void;
  completed?: boolean;
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
  completed = false
}: PersonalAdoptCardProps) => {
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
          <ImageWithSkeleton uri={uri} />
          {completed && <CompletedDim />}
          {badgeLabel && (
            <ProtectionBadge>
              <ProtectionText>{badgeLabel}</ProtectionText>
            </ProtectionBadge>
          )}
          {imageCount > 1 && (
            <ImageCountBadge>
              <Images size={12} color="#fff" />
              <ImageCountText>{imageCount}</ImageCountText>
            </ImageCountBadge>
          )}
        </ImageContainer>

        <TitleRow>
          <Title>{title}</Title>
          {!!dateText && <DateText>{dateText}</DateText>}
        </TitleRow>
        {!!intro && <IntroText>{intro}</IntroText>}
        {(!!breed || !!region) && (
          <MetaRows>
            {!!breed && (
              <MetaRow>
                <MetaLabel>품종</MetaLabel>
                <MetaValue>{breed}</MetaValue>
              </MetaRow>
            )}
            {!!region && (
              <MetaRow>
                <MetaLabel>지역</MetaLabel>
                <MetaValue>{region}</MetaValue>
              </MetaRow>
            )}
          </MetaRows>
        )}
        {!!chips?.length && <AdoptChips chips={chips} />}
      </Pressable>

      {onPressFavorite && (
        <Pressable style={styles.favoriteButton} hitSlop={10} onPress={handlePressFavorite}>
          <AnimatedHeart isLiked={isLiked} size={20} strokeWidth={2} inactiveColor="#FFFFFF" />
        </Pressable>
      )}
    </Container>
  );
};

export const PersonalAdoptCard = memo(PersonalAdoptCardComponent);
PersonalAdoptCard.displayName = 'PersonalAdoptCard';

const ImageWithSkeleton = ({ uri }: { uri: string }) => {
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
      style={styles.image}
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
  mb: 18
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

const ImageCountBadge = styled(XStack, {
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

const ImageCountText = styled(Text, {
  fontWeight: 600,
  fontSize: 12,
  lineHeight: 14,
  color: '#fff'
});

const TitleRow = styled(XStack, {
  items: 'flex-start',
  justify: 'space-between',
  gap: 12,
  mb: 14
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
  numberOfLines: 2,
  ellipsizeMode: 'tail',
  mb: 14
});

const MetaRows = styled(View, {
  gap: 10,
  mb: 14
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
  color: '$black600'
});

const MetaValue = styled(Text, {
  flex: 1,
  fontWeight: 500,
  fontSize: 13,
  lineHeight: 15,
  color: '$black700',
  numberOfLines: 1,
  ellipsizeMode: 'tail'
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
