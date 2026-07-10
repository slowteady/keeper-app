import { Play } from '@tamagui/lucide-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet } from 'react-native';
import { styled, View, YStack } from 'tamagui';

import { Close } from '@/shared/ui/icons/outline';

export type VideoAttachmentProps = {
  thumbnailUri: string;
  size?: number;
  readOnly?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
};

export const VideoAttachment = ({
  thumbnailUri,
  size = 72,
  readOnly = false,
  onPress,
  onRemove
}: VideoAttachmentProps) => {
  return (
    <Box width={size} height={size}>
      <Pressable style={styles.thumbnailPress} onPress={onPress} disabled={!onPress}>
        <Image source={thumbnailUri} style={styles.thumbnail} contentFit="cover" />
        <View style={styles.playBadge}>
          <Play size={14} color="white" />
        </View>
      </Pressable>

      {!readOnly && onRemove && (
        <View style={styles.removeButton} onPress={onRemove}>
          <RemoveBackground>
            <Close width={12} height={12} color="white" />
          </RemoveBackground>
        </View>
      )}
    </Box>
  );
};

const Box = styled(YStack, {
  position: 'relative',
  rounded: '$4',
  overflow: 'hidden',
  bg: '$black10'
});

const RemoveBackground = styled(YStack, {
  width: 22,
  height: 22,
  rounded: 12,
  bg: '$black700',
  items: 'center',
  justify: 'center'
});

const styles = StyleSheet.create({
  thumbnailPress: { width: '100%', height: '100%' },
  thumbnail: { width: '100%', height: '100%' },
  playBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 28,
    height: 28,
    marginTop: -14,
    marginLeft: -14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)'
  },
  removeButton: { position: 'absolute', top: 4, right: 4, zIndex: 2 }
});
