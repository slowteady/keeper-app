import { useVideoPlayer, VideoView } from 'expo-video';
import { Modal, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled, useTheme, XStack, YStack } from 'tamagui';

import { Close } from '../icons/outline';

export type VideoViewerProps = {
  onClose: () => void;
  uri: string;
};

export const VideoViewer = ({ onClose, uri }: VideoViewerProps) => {
  const insets = useSafeAreaInsets();
  const { white900 } = useTheme();

  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = true;
    instance.muted = false;
    instance.play();
  });

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <YStack flex={1} bg="$black900">
        <VideoView style={styles.video} player={player} nativeControls contentFit="contain" allowsFullscreen />
        <IconButton position="absolute" z={2} r={20} t={insets.top + 10} onPress={onClose}>
          <Close width={18} height={18} color={white900.val} />
        </IconButton>
      </YStack>
    </Modal>
  );
};

const IconButton = styled(XStack, {
  items: 'center',
  justify: 'center',
  width: 42,
  height: 42,
  rounded: 99,
  bg: 'rgba(0, 0, 0, 0.5)'
});

const styles = StyleSheet.create({
  video: { flex: 1 }
});
