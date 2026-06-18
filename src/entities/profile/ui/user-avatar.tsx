import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [image]);

  if (loading) {
    return <Skeleton style={{ width: 72, height: 72, borderRadius: 8 }} />;
  }

  if (!image) {
    return <EmptyAvatar onPress={onPressAdd} />;
  }

  return (
    <Container>
      <ImageBox>
        <Image
          source={{ uri: image }}
          cachePolicy="memory-disk"
          transition={0}
          contentFit="cover"
          style={styles.image}
          onLoad={() => setLoaded(true)}
        />
        {!loaded && <Skeleton style={StyleSheet.absoluteFill} />}
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
