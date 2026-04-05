import { Image } from 'expo-image';
import { useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { NoImage, Skeleton } from '@/shared/ui';

export type AdoptCardProps = {
  uri: string;
  title: string;
  description: AdoptCardDescriptionsProps['data'];
  chips?: AdoptCardChipsProps['data'];
  horizontal?: boolean;
};

export const ADOPT_CARD_IMAGE_SIZES = {
  small: (Dimensions.get('window').width - 48) / 2, // 2컬럼 기준 양쪽 20패딩 제외한 너비, 카드 간 8패딩 제외한 너비
  medium: 220
} as const;

export const AdoptCard = ({ uri, title, description, chips, horizontal = false }: AdoptCardProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  const size = horizontal ? 'medium' : 'small';
  const hasChips = chips && chips.length > 0;

  return (
    <Container size={size}>
      <ImageContainer size={size}>
        {!isLoaded && !isError && (
          <Skeleton style={{ position: 'absolute', top: 0, width: '100%', height: '100%', borderRadius: 8 }} />
        )}
        {uri && !isError ? (
          <Image
            key={uri}
            source={{ uri }}
            onLoad={() => setIsLoaded(true)}
            onError={() => setIsError(true)}
            style={styles.image}
          />
        ) : (
          <View style={styles.image}>
            <NoImage />
          </View>
        )}
      </ImageContainer>

      <Title size={size}>{title}</Title>

      <DescriptionContainer size={size} gap={10}>
        <AdoptCardDescriptions data={description} size={size} />
      </DescriptionContainer>

      {hasChips && <AdoptCardChips data={chips} />}
    </Container>
  );
};

export type AdoptCardDescriptionsProps = {
  data: { label: string; value: string }[];
  size?: keyof typeof ADOPT_CARD_IMAGE_SIZES;
};

export const AdoptCardDescriptions = ({ data, size = 'medium' }: AdoptCardDescriptionsProps) => {
  return data.map(({ label, value }, idx) => (
    <DescriptionWrap key={`${label}-${idx}`} size={size}>
      <DescriptionLabel size={size}>{label}</DescriptionLabel>
      <DescriptionValue size={size}>{value}</DescriptionValue>
    </DescriptionWrap>
  ));
};

export type AdoptCardChipsProps = {
  data: { id: string; value: string; variant?: AdoptCardChipVariant }[];
};
export type AdoptCardChipVariant = 'error' | 'success' | 'notice' | 'default';
export const AdoptCardChips = ({ data }: AdoptCardChipsProps) => {
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
  }
});
