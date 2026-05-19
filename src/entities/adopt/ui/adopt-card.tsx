import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { Dimensions, Pressable, StyleSheet } from 'react-native';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { ChipVariant } from '@/entities/adopt';
import { Skeleton } from '@/shared/ui';
import { AnimatedHeart } from '@/shared/ui/icons/animation';

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
  onPressFavorite
}: AdoptCardProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const size = horizontal ? 'medium' : 'small';
  const hasChips = chips && chips.length > 0;

  const handlePressFavorite = useCallback(() => {
    if (!onPressFavorite) return;
    impactAsync(isFavorited ? ImpactFeedbackStyle.Light : ImpactFeedbackStyle.Medium).catch(() => undefined);
    onPressFavorite();
  }, [isFavorited, onPressFavorite]);

  return (
    <Container size={size}>
      {/* 카드 전체 클릭 — Pressable. 하트는 형제 absolute Pressable 로 분리해 onPress 충돌 방지. */}
      <Pressable onPress={onPress} disabled={!onPress}>
        <ImageContainer size={size}>
          {!isLoaded && (
            <Skeleton style={{ position: 'absolute', top: 0, width: '100%', height: '100%', borderRadius: 8 }} />
          )}
          {uri && (
            <Image
              key={uri}
              source={{ uri }}
              onLoad={() => setIsLoaded(true)}
              onError={() => setIsLoaded(false)}
              style={styles.image}
            />
          )}
        </ImageContainer>

        <Title size={size}>{title}</Title>

        <DescriptionContainer size={size} gap={10}>
          <AdoptCardDescriptions data={description} size={size} />
        </DescriptionContainer>

        {hasChips && <AdoptCardChips data={chips} />}
      </Pressable>

      {onPressFavorite && (
        <Pressable style={styles.favoriteButton} hitSlop={10} onPress={handlePressFavorite}>
          {/* 사진 위 가독성 — 굵기 강조 */}
          <AnimatedHeart isLiked={isFavorited} size={22} strokeWidth={2.5} />
        </Pressable>
      )}
    </Container>
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
    <ChipContainer gap={4}>
      {data.map(({ id, value, variant = 'default' }, idx) => (
        <ChipItem key={`${id}-${idx}`} variant={variant}>
          <ChipText variant={variant}>{value}</ChipText>
        </ChipItem>
      ))}
    </ChipContainer>
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
  rowGap: 8,
  flexWrap: 'wrap'
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
      }
    }
  } as const
});

const styles = StyleSheet.create({
  image: {
    width: '100%',
    borderRadius: 8,
    aspectRatio: 5 / 4
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    // 사진 위 가독성 — backdrop 없이 drop shadow 만으로 띄움
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3
  }
});
