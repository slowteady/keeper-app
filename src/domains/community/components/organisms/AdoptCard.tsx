import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

import { Carousel } from '@/shared/components/molecules/Carousel';
import { theme } from '@/shared/constants/theme.constants';

export interface AdoptCardProps {
  value: any;
}

export const AdoptCard = ({ value }: AdoptCardProps) => {
  const { title, content, animalType, images, comments, likes, views } = value;

  return (
    <>
      <View style={styles.headerContainer}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
          {title}
        </Text>
        <Text numberOfLines={2} ellipsizeMode="tail" style={styles.content}>
          {content}
        </Text>
      </View>

      <View style={styles.chipContainer}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>강아지</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText}>입양홍보</Text>
        </View>
      </View>

      <View style={styles.imageContainer}>
        <Carousel data={images} showIndicator />
      </View>

      <View style={styles.iconContainer}>
        <Pressable style={styles.iconWrap}>
          {/* <MarkChatUnread width={20} height={20} /> */}
          {/* <Text style={styles.iconText}>{formatCount(comments)}</Text> */}
        </Pressable>
        <Pressable style={styles.iconWrap}>
          {/* <Favorite width={20} height={20} /> */}
          {/* <Text style={styles.iconText}>{formatCount(likes)}</Text> */}
        </Pressable>
        <Pressable style={styles.iconWrap}>
          {/* <Visibility width={20} height={20} /> */}
          {/* <Text style={styles.iconText}>{formatCount(views)}</Text> */}
        </Pressable>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: { marginBottom: 20 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '600', marginBottom: 16 },
  content: { fontSize: 15, lineHeight: 25, fontWeight: '400' },
  chipContainer: { marginBottom: 16, display: 'flex', flexDirection: 'row', gap: 4, flexWrap: 'wrap', rowGap: 6 },
  chip: {
    backgroundColor: theme.colors.white[800],
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 2,
    alignSelf: 'baseline'
  },
  chipText: { color: theme.colors.black[600], fontSize: 11, fontWeight: '400', lineHeight: 13 },
  imageContainer: { height: Dimensions.get('screen').width * 0.85, marginBottom: 10 },
  iconContainer: { paddingVertical: 6, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 7 },
  iconWrap: { display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'center' },
  iconText: { fontSize: 12, fontWeight: '400', lineHeight: 14, color: theme.colors.black[600] }
});
