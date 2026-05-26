import { Avatar, styled, View } from 'tamagui';

import { User } from '@/shared/ui/icons/outline';

export type ProfileAvatarProps = {
  image?: string | null;
  size: number;
  shape?: 'circle' | 'rounded';
};

export const ProfileAvatar = ({ image, size, shape = 'circle' }: ProfileAvatarProps) => {
  const iconSize = Math.round(size * 0.55);
  return (
    <StyledAvatar size={size} circular={shape === 'circle'} rounded={shape === 'rounded' ? 4 : undefined}>
      {image ? <Avatar.Image source={{ uri: image }} /> : null}
      <Avatar.Fallback>
        <FallbackBg>
          <User width={iconSize} height={iconSize} color="#B8BCB9" />
        </FallbackBg>
      </Avatar.Fallback>
    </StyledAvatar>
  );
};

const StyledAvatar = styled(Avatar, {
  bg: '$white800'
});

const FallbackBg = styled(View, {
  width: '100%',
  height: '100%',
  items: 'center',
  justify: 'center',
  bg: '$white800'
});
