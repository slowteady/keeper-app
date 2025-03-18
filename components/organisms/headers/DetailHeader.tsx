import { ArrowLeftIcon } from '@/components/atoms/icons/ArrowIcon';
import { HomeIcon } from '@/components/atoms/icons/HomeIcon';
import theme from '@/constants/theme';
import { useLayout } from '@/hooks/useLayout';
import { router } from 'expo-router';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

const DetailHeader = () => {
  const { top: headerTop } = useLayout();

  const handlePressBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };
  const handlePressHome = () => {
    router.replace('/');
  };

  return (
    <View style={[styles.container, { paddingTop: headerTop }]}>
      <TouchableOpacity onPress={handlePressBack} activeOpacity={0.5}>
        <ArrowLeftIcon width={24} height={24} />
      </TouchableOpacity>

      <View style={styles.rightContainer}>
        <TouchableOpacity onPress={handlePressHome} activeOpacity={0.5}>
          <HomeIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DetailHeader;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: theme.colors.background.default,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.white[600],
    borderStyle: 'solid',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.14,
        shadowRadius: 4
      },
      android: {
        elevation: 4
      }
    })
  },
  rightContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12
  }
});
