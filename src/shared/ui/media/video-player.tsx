import { Volume2, VolumeX } from '@tamagui/lucide-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { View } from 'tamagui';

export type VideoPlayerProps = {
  uri: string;
  radius?: number;
};

export const VideoPlayer = ({ uri, radius = 10 }: VideoPlayerProps) => {
  const [muted, setMuted] = useState(true);

  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = true;
    instance.muted = true;
    instance.play();
  });

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  return (
    <View style={[styles.container, { borderRadius: radius }]}>
      <VideoView
        style={[styles.video, { borderRadius: radius }]}
        player={player}
        nativeControls={false}
        contentFit="cover"
      />
      <Pressable style={styles.muteButton} hitSlop={8} onPress={() => setMuted((prev) => !prev)}>
        <View style={styles.muteBackground}>
          {muted ? <VolumeX size={16} color="white" /> : <Volume2 size={16} color="white" />}
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', height: '100%', overflow: 'hidden' },
  video: { width: '100%', height: '100%' },
  muteButton: { position: 'absolute', bottom: 12, left: 16 },
  muteBackground: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  }
});
