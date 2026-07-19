import { useRecyclingState } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { StatusChip, StatusDimOverlay } from '@/shared/ui/data-display/status-overlay';
import { NoImage } from '@/shared/ui/fallback/no-image';

import { MISSING_STATUS_INFO } from '../constant';
import { MissingStatusDto } from '../schema';

export type MissingCardProps = {
  uri: string;
  kind: string;
  region: string;
  date: string;
  specialMark?: string;
  status?: MissingStatusDto;
  onPress?: () => void;
};

const MissingCardComponent = ({ uri, kind, region, date, specialMark, status, onPress }: MissingCardProps) => {
  const cardTap = useMemo(
    () =>
      Gesture.Tap()
        .maxDuration(250)
        .maxDeltaX(8)
        .maxDeltaY(8)
        .enabled(!!onPress)
        .onEnd((_e, success) => {
          if (success) onPress?.();
        })
        .runOnJS(true),
    [onPress]
  );

  return (
    <GestureDetector gesture={cardTap}>
      <Container>
        <ImageContainer>
          <CardImage uri={uri} />
          {status === 'RESOLVED' && (
            <>
              <StatusDimOverlay rounded={12} />
              <StatusChip label={MISSING_STATUS_INFO.RESOLVED.label} />
            </>
          )}
        </ImageContainer>

        <Title numberOfLines={2}>{kind}</Title>

        {!!specialMark && (
          <IntroText numberOfLines={2} ellipsizeMode="tail">
            {specialMark}
          </IntroText>
        )}

        <MetaRows>
          {!!date && (
            <MetaRow>
              <MetaLabel>실종일</MetaLabel>
              <MetaValue>{date}</MetaValue>
            </MetaRow>
          )}
          {!!region && (
            <MetaRow>
              <MetaLabel>실종장소</MetaLabel>
              <MetaValue numberOfLines={1} ellipsizeMode="tail">
                {region}
              </MetaValue>
            </MetaRow>
          )}
        </MetaRows>
      </Container>
    </GestureDetector>
  );
};

export const MissingCard = memo(MissingCardComponent);
MissingCard.displayName = 'MissingCard';

const CardImage = ({ uri }: { uri: string }) => {
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

const Container = styled(View, {
  width: '100%'
});

const ImageContainer = styled(View, {
  width: '100%',
  aspectRatio: 4 / 3,
  mb: 18
});

const Title = styled(Text, {
  fontWeight: 600,
  fontSize: 17,
  lineHeight: 26,
  color: '$black900',
  ellipsizeMode: 'tail',
  mb: 14
});

const IntroText = styled(Text, {
  fontWeight: 400,
  fontSize: 14,
  lineHeight: 22,
  color: '$black600',
  mb: 14
});

const MetaRows = styled(YStack, {
  gap: 10
});

const MetaRow = styled(XStack, {
  items: 'center'
});

const MetaLabel = styled(Text, {
  minW: 64,
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
  color: '$black700'
});

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#F2F3F5'
  }
});
