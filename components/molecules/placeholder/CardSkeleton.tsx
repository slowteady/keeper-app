import { StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton';

interface CardSkeletonProps {
  size?: CardSkeltonSize;
}
type CardSkeltonSize = 'small';
const CardSkeleton = ({ size = 'small' }: CardSkeletonProps) => {
  const { width, height } = getSize(size);

  return (
    <View style={styles.container}>
      <View style={{ width, height }}>
        <Skeleton style={{ width: '100%', height: '100%', borderRadius: 8 }} />
      </View>
    </View>
  );
};

export default CardSkeleton;

const getSize = (size: CardSkeltonSize) => {
  switch (size) {
    case 'small': {
      return { width: 220, height: 170 };
    }
  }
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column'
  }
});
