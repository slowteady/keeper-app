import { Volume2, VolumeX } from '@tamagui/lucide-icons';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { View } from 'tamagui';

import { Skeleton } from '../fallback';
import { VideoViewer } from './video-viewer';

export type VideoPlayerProps = {
  uri: string;
  thumbnailUrl?: string;
  radius?: number;
};

export const VideoPlayer = ({ uri, thumbnailUrl, radius = 10 }: VideoPlayerProps) => {
  const [muted, setMuted] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [ready, setReady] = useState(false);

  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = true;
    instance.muted = true;
    instance.play();
  });

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  useEffect(() => {
    if (viewerOpen) player.pause();
    else player.play();
  }, [viewerOpen, player]);

  const openViewer = Gesture.Tap()
    .onEnd(() => setViewerOpen(true))
    .runOnJS(true);

  return (
    <View style={[styles.container, { borderRadius: radius }]}>
      <VideoView
        style={[styles.video, { borderRadius: radius }]}
        player={player}
        nativeControls={false}
        contentFit="cover"
        onFirstFrameRender={() => setReady(true)}
      />
      <View style={[StyleSheet.absoluteFill, { borderRadius: radius, opacity: ready ? 0 : 1 }]} pointerEvents="none">
        <Skeleton style={[styles.video, { borderRadius: radius }]} />
        {thumbnailUrl && (
          <Image
            source={thumbnailUrl}
            cachePolicy="memory-disk"
            contentFit="cover"
            style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          />
        )}
      </View>
      <GestureDetector gesture={openViewer}>
        <View style={StyleSheet.absoluteFill} />
      </GestureDetector>
      <Pressable style={styles.muteButton} hitSlop={8} onPress={() => setMuted((prev) => !prev)}>
        <View style={styles.muteBackground}>
          {muted ? <VolumeX size={16} color="white" /> : <Volume2 size={16} color="white" />}
        </View>
      </Pressable>
      {viewerOpen && <VideoViewer uri={uri} onClose={() => setViewerOpen(false)} />}
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
