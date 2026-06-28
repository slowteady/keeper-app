import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import { styled, View } from 'tamagui';

import { Skeleton } from '@/shared/ui';
import { Pencil } from '@/shared/ui/icons/outline';

import { EmptyAvatar } from './empty-avatar';

export type UserAvatarProps = {
  image?: string | null;
  loading?: boolean;
  onPressAdd?: () => void;
  onPressEdit?: () => void;
};

export const UserAvatar = ({ image, loading, onPressAdd, onPressEdit }: UserAvatarProps) => {
  if (loading) {
    return <Skeleton testID="user-avatar-skeleton" style={{ width: 72, height: 72, borderRadius: 8 }} />;
  }

  if (!image) {
    return <EmptyAvatar onPress={onPressAdd} />;
  }

  return (
    <Container>
      <ImageBox>
        <Image
          testID="user-avatar-image"
          source={{ uri: image }}
          cachePolicy="memory-disk"
          transition={0}
          contentFit="cover"
          style={styles.image}
        />
      </ImageBox>
      {onPressEdit && (
        <EditButton onPress={onPressEdit} hitSlop={12}>
          <Pencil width={10} height={10} color="white" />
        </EditButton>
      )}
    </Container>
  );
};

const Container = styled(View, {
  width: 72,
  height: 72,
  position: 'relative'
});

const ImageBox = styled(View, {
  width: 72,
  height: 72,
  rounded: 8,
  borderWidth: 1,
  borderColor: '$black500',
  bg: '$white800',
  overflow: 'hidden'
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

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' }
});
