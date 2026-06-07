import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { Dimensions, Pressable, StyleSheet } from 'react-native';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { toggleHaptic } from '@/shared/lib';
import { Skeleton } from '@/shared/ui';
import { NoImage } from '@/shared/ui/fallback/no-image';
import { AnimatedHeart } from '@/shared/ui/icons/animation';

import { ADOPT_STATUS_INFO, isAdoptEnded } from '../constant';
import type { ChipVariant } from '../mapper';
import type { AdoptStatusDto } from '../schema';

const STATUS_CHIP_IDS = ['NEAR_DEADLINE', 'NEW', 'DDAY'];

export type AdoptCardProps = {
  uri: string;
  title: string;
  description: AdoptCardDescriptionsProps['data'];
  chips?: AdoptCardChipsProps['data'];
  horizontal?: boolean;
  // 카드 전체 onPress — 부모 View onPress wrap 대신 카드가 직접 받아야 형제 하트 Pressable 과 hit 충돌이 안 난다.
  onPress?: () => void;
  isFavorited?: boolean;
  onPressFavorite?: () => void;
  status?: AdoptStatusDto;
};

export const ADOPT_CARD_IMAGE_SIZES = {
  small: (Dimensions.get('window').width - 48) / 2, // 2컬럼 기준 양쪽 20패딩 제외한 너비, 카드 간 8패딩 제외한 너비
  medium: 220
} as const;

export const AdoptCard = ({
  uri,
  title,
  description,
  chips,
  horizontal = false,
  onPress,
  isFavorited = false,
  onPressFavorite,
  status
}: AdoptCardProps) => {
  const size = horizontal ? 'medium' : 'small';
  const statusChips = chips?.filter((c) => STATUS_CHIP_IDS.includes(c.id)) ?? [];
  const attributeChips = chips?.filter((c) => !STATUS_CHIP_IDS.includes(c.id)) ?? [];

  const handlePressFavorite = useCallback(() => {
    if (!onPressFavorite) return;
    toggleHaptic(isFavorited);
    onPressFavorite();
  }, [isFavorited, onPressFavorite]);

  return (
    <Container size={size}>
      <Pressable onPress={onPress} disabled={!onPress}>
        <ImageContainer size={size}>
          <ImageWithSkeleton key={uri} uri={uri} />
          {status && <StatusBadge status={status} />}
          {statusChips.length > 0 && <StatusChipOverlay data={statusChips} />}
        </ImageContainer>

        <Title size={size}>{title}</Title>

        <DescriptionContainer size={size} gap={10}>
          <AdoptCardDescriptions data={description} size={size} />
        </DescriptionContainer>

        {attributeChips.length > 0 && <AdoptCardChips data={attributeChips} />}
      </Pressable>

      {onPressFavorite && (
        <Pressable style={styles.favoriteButton} hitSlop={10} onPress={handlePressFavorite}>
          <AnimatedHeart isLiked={isFavorited} size={18} strokeWidth={2} inactiveColor="#FFFFFF" />
        </Pressable>
      )}
    </Container>
  );
};

const StatusBadge = ({ status }: { status: AdoptStatusDto }) => {
  if (!isAdoptEnded(status)) return null;
  const info = ADOPT_STATUS_INFO[status];
  return (
    <View
      position="absolute"
      t={8}
      l={8}
      px={8}
      py={4}
      rounded={999}
      bg={info.tone === 'positive' ? '$successMain' : '$black700'}
    >
      <Text fontWeight={600} fontSize={11} lineHeight={13} color="#fff">
        {info.label}
      </Text>
    </View>
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
        <Skeleton style={{ position: 'absolute', top: 0, width: '100%', height: '100%', borderRadius: 8 }} />
      )}
      <Image source={{ uri }} onLoad={handleLoad} onError={handleError} style={styles.image} />
    </>
  );
};

type AdoptCardDescriptionsProps = {
  data: { label: string; value: string }[];
  size?: keyof typeof ADOPT_CARD_IMAGE_SIZES;
};

const AdoptCardDescriptions = ({ data, size = 'medium' }: AdoptCardDescriptionsProps) => {
  return data.map(({ label, value }, idx) => (
    <DescriptionWrap key={`${label}-${idx}`} size={size}>
      <DescriptionLabel size={size}>{label}</DescriptionLabel>
      <DescriptionValue size={size}>{value}</DescriptionValue>
    </DescriptionWrap>
  ));
};

type AdoptCardChipsProps = {
  data: { id: string; value: string; variant?: ChipVariant }[];
};
const AdoptCardChips = ({ data }: AdoptCardChipsProps) => {
  return (
    <ChipContainer>
      {data.map(({ id, value, variant = 'default' }, idx) => (
        <ChipItem key={`${id}-${idx}`} variant={variant}>
          <ChipText variant={variant}>{value}</ChipText>
        </ChipItem>
      ))}
    </ChipContainer>
  );
};

const StatusChipOverlay = ({ data }: AdoptCardChipsProps) => {
  return (
    <XStack position="absolute" t={8} l={8} gap={4}>
      {data.map(({ id, value, variant = 'default' }, idx) => (
        <OverlayBadge key={`${id}-${idx}`} variant={variant}>
          <OverlayBadgeText>{value}</OverlayBadgeText>
        </OverlayBadge>
      ))}
    </XStack>
  );
};

const Container = styled(View, {
  variants: {
    size: {
      small: {
        width: ADOPT_CARD_IMAGE_SIZES.small
      },
      medium: {
        width: ADOPT_CARD_IMAGE_SIZES.medium
      }
    }
  } as const
});

const ImageContainer = styled(View, {
  aspectRatio: 5 / 4,
  variants: {
    size: {
      small: {
        width: ADOPT_CARD_IMAGE_SIZES.small,
        mb: 16
      },
      medium: {
        width: ADOPT_CARD_IMAGE_SIZES.medium,
        mb: 20
      }
    }
  } as const
});

const Title = styled(Text, {
  fontWeight: 600,
  color: '$black900',
  numberOfLines: 1,
  ellipsizeMode: 'tail',
  mb: 20,
  variants: {
    size: {
      small: {
        fontSize: 18,
        lineHeight: 20,
        mb: 14
      },
      medium: {
        fontSize: 20,
        lineHeight: 22
      }
    }
  } as const
});

const DescriptionContainer = styled(YStack, {
  variants: {
    size: {
      small: { mb: 16 },
      medium: { mb: 20 }
    }
  }
});

const DescriptionWrap = styled(XStack, {
  flex: 1,
  items: 'center',
  variants: {
    size: {
      small: {},
      medium: { gap: 16 }
    }
  } as const
});

const DescriptionLabel = styled(Text, {
  fontWeight: 500,
  color: '$black600',
  minW: 57,
  shrink: 0,
  variants: {
    size: {
      small: { fontSize: 13, lineHeight: 15 },
      medium: { fontSize: 15, lineHeight: 17 }
    }
  } as const
});

const DescriptionValue = styled(Text, {
  fontWeight: 500,
  color: '$black700',
  flex: 1,
  numberOfLines: 1,
  ellipsizeMode: 'tail',
  variants: {
    size: {
      small: { fontSize: 13, lineHeight: 15 },
      medium: { fontSize: 15, lineHeight: 17 }
    }
  } as const
});

const ChipContainer = styled(XStack, {
  gap: 4,
  overflow: 'hidden'
});

const ChipItem = styled(View, {
  self: 'baseline',
  rounded: 4,
  px: 6,
  py: 4,
  variants: {
    variant: {
      error: {
        backgroundColor: '$errorLightest'
      },
      success: {
        backgroundColor: '$successLightest'
      },
      notice: {
        backgroundColor: '$noticeLightest'
      },
      default: {
        backgroundColor: '$backgroundDefault'
      },
      dog: {
        backgroundColor: '$dogLightest'
      },
      cat: {
        backgroundColor: '$catLightest'
      },
      etc: {
        backgroundColor: '$etcLightest'
      }
    }
  } as const
});

const ChipText = styled(Text, {
  fontWeight: 400,
  fontSize: 11,
  lineHeight: 13,
  variants: {
    variant: {
      error: {
        color: '$errorMain'
      },
      success: {
        color: '$successMain'
      },
      notice: {
        color: '$noticeMain'
      },
      default: {
        color: '$black600'
      },
      dog: {
        color: '$dogMain'
      },
      cat: {
        color: '$catMain'
      },
      etc: {
        color: '$etcMain'
      }
    }
  } as const
});

const OverlayBadge = styled(View, {
  px: 8,
  py: 4,
  rounded: 999,
  variants: {
    variant: {
      error: { backgroundColor: '$errorMain' },
      success: { backgroundColor: '$successMain' },
      notice: { backgroundColor: '$noticeMain' },
      default: { backgroundColor: '$black700' },
      dog: { backgroundColor: '$dogMain' },
      cat: { backgroundColor: '$catMain' },
      etc: { backgroundColor: '$etcMain' }
    }
  } as const
});

const OverlayBadgeText = styled(Text, {
  fontWeight: 600,
  fontSize: 11,
  lineHeight: 13,
  color: '#fff'
});

const styles = StyleSheet.create({
  image: {
    width: '100%',
    borderRadius: 8,
    aspectRatio: 5 / 4
  },
  favoriteButton: {
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
