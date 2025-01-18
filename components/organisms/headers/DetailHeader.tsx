import { ArrowLeftIcon } from '@/components/atoms/icons/ArrowIcon';
import { HomeIcon } from '@/components/atoms/icons/HomeIcon';
import { SearchIcon } from '@/components/atoms/icons/SearchIcon';
import theme from '@/constants/theme';
import { useLayout } from '@/hooks/useLayout';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const DetailHeader = () => {
  const { headerTop } = useLayout();

  const handlePressBack = () => {
    router.back();
  };

  const handlePressHome = () => {
    router.replace('/');
  };

  const handlePressSearch = () => {
    //
  };

  return (
    <View style={[styles.container, { paddingTop: headerTop }]}>
      <TouchableOpacity onPress={handlePressBack}>
        <ArrowLeftIcon width={24} height={24} />
      </TouchableOpacity>

      <View style={styles.rightContainer}>
        <TouchableOpacity onPress={handlePressHome}>
          <HomeIcon />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePressSearch}>
          <SearchIcon />
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
    borderStyle: 'solid'
  },
  rightContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12
  }
});
