import { StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton';

interface CardSkeletonProps {
  width: number;
}

export const CardSkeleton = ({ width }: CardSkeletonProps) => {
  return (
    <View style={[styles.container, { width }]}>
      <View style={{ width, aspectRatio: 5 / 4, marginBottom: 20 }}>
        <Skeleton style={[styles.skeleton, { borderRadius: 8 }]} />
      </View>
      <View style={styles.title}>
        <Skeleton style={styles.skeleton} />
      </View>
      <View style={{ marginBottom: 20 }}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <View key={idx} style={styles.description}>
            <Skeleton style={styles.skeleton} />
          </View>
        ))}
      </View>
      <View style={[styles.description]}>
        <Skeleton style={styles.skeleton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  skeleton: {
    width: '100%',
    height: '100%',
    borderRadius: 4
  },
  title: {
    width: '50%',
    height: 20,
    marginBottom: 30
  },
  description: {
    height: 10,
    marginBottom: 16
  }
});
