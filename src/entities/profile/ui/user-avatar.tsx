import { Pencil } from '@tamagui/lucide-icons';
import { Avatar, styled, View } from 'tamagui';

import { EmptyAvatar } from './empty-avatar';

export interface UserAvatarProps {
  image?: string | null;
  onPressAdd?: () => void;
  onPressEdit?: () => void;
}

export const UserAvatar = ({ image, onPressAdd, onPressEdit }: UserAvatarProps) => {
  return (
    <StyledAvatar>
      {image && <AvatarImage source={{ uri: image }} />}

      <Avatar.Fallback z={10}>
        <EmptyAvatar onPress={onPressAdd} />
      </Avatar.Fallback>

      {image && onPressEdit && (
        <EditButton onPress={onPressEdit} hitSlop={12}>
          <Pencil size={10} color="$white900" />
        </EditButton>
      )}
    </StyledAvatar>
  );
};

const StyledAvatar = styled(Avatar, {
  size: 72,
  rounded: 8,
  position: 'relative',
  borderWidth: 1,
  borderColor: '$black500'
});

const AvatarImage = styled(Avatar.Image, {
  width: '100%',
  height: '100%',
  resizeMode: 'cover'
});

const EditButton = styled(View, {
  position: 'absolute',
  width: 20,
  height: 20,
  rounded: 99,
  bg: '#505050',
  t: 4,
  r: 4,
  items: 'center',
  justify: 'center',
  z: 10
});
