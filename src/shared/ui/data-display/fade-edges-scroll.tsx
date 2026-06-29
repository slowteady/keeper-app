import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef, useCallback, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, ScrollViewProps, StyleSheet } from 'react-native';

export type FadeEdgesScrollViewProps = ScrollViewProps & {
  fadeWidth?: number;
};

const OPAQUE = '#000';
const CLEAR = 'transparent';

export const FadeEdgesScrollView = forwardRef<ScrollView, FadeEdgesScrollViewProps>(
  ({ children, fadeWidth = 28, onScroll, onLayout, onContentSizeChange, ...rest }, ref) => {
    const metrics = useRef({ offset: 0, content: 0, layout: 0 });
    const [edges, setEdges] = useState({ left: false, right: false });

    const recompute = useCallback(() => {
      const { offset, content, layout } = metrics.current;
      const left = offset > 4;
      const right = content - layout - offset > 4;
      setEdges((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
    }, []);

    const handleScroll = useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        metrics.current.offset = e.nativeEvent.contentOffset.x;
        recompute();
        onScroll?.(e);
      },
      [onScroll, recompute]
    );

    const ratio = metrics.current.layout > 0 ? Math.min(fadeWidth / metrics.current.layout, 0.4) : 0.08;
    const maskColors = [edges.left ? CLEAR : OPAQUE, OPAQUE, OPAQUE, edges.right ? CLEAR : OPAQUE] as const;
    const maskLocations = [0, ratio, 1 - ratio, 1] as const;

    return (
      <MaskedView
        style={styles.flex}
        maskElement={
          <LinearGradient
            style={styles.flex}
            colors={maskColors}
            locations={maskLocations}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        }
      >
        <ScrollView
          ref={ref}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onLayout={(e) => {
            metrics.current.layout = e.nativeEvent.layout.width;
            recompute();
            onLayout?.(e);
          }}
          onContentSizeChange={(w, h) => {
            metrics.current.content = w;
            recompute();
            onContentSizeChange?.(w, h);
          }}
          {...rest}
        >
          {children}
        </ScrollView>
      </MaskedView>
    );
  }
);

FadeEdgesScrollView.displayName = 'FadeEdgesScrollView';

const styles = StyleSheet.create({
  flex: { flex: 1 }
});
