import { Image } from 'expo-image';
import { styled, View } from 'tamagui';

import { User } from '@/shared/ui/icons/outline';

export type ProfileAvatarProps = {
  image?: string | null;
  size: number;
  shape?: 'circle' | 'rounded';
};

export const ProfileAvatar = ({ image, size, shape = 'circle' }: ProfileAvatarProps) => {
  const iconSize = Math.round(size * 0.55);
  const radius = shape === 'circle' ? size / 2 : 4;

  return (
    <Box style={{ width: size, height: size, borderRadius: radius }}>
      {image ? (
        <Image
          source={{ uri: image }}
          cachePolicy="memory-disk"
          transition={0}
          contentFit="cover"
          style={{ width: size, height: size }}
        />
      ) : (
        <User width={iconSize} height={iconSize} color="#B8BCB9" />
      )}
    </Box>
  );
};

const Box = styled(View, {
  bg: '$white800',
  items: 'center',
  justify: 'center',
  overflow: 'hidden'
});
