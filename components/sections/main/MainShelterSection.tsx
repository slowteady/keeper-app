import { NavArrowIcon } from '@/components/atoms/icons/ArrowIcon';
import { ShelterMap } from '@/components/organisms/map/ShelterMap';
import theme from '@/constants/theme';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const MainShelterSection = () => {
  const handlePressButton = () => {
    router.push('/shelters');
  };

  const distanceValue = {
    '1km': 0,
    '10km': 0,
    '30km': 0,
    '50km': 0
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>우리동네 보호소 찾기</Text>
        <Pressable style={styles.flex} onPress={handlePressButton}>
          <Text style={styles.label}>전체보기</Text>
          <NavArrowIcon />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 20, flex: 1 }}>
        <ShelterMap.DistanceBox style={{ marginBottom: 16 }} value={distanceValue} />
        <ShelterMap />
      </View>
    </View>
  );
};

export default MainShelterSection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
    paddingVertical: 48
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingHorizontal: 20
  },
  title: {
    color: theme.colors.black[900],
    fontSize: 28,
    fontWeight: '500'
  },
  label: {
    color: theme.colors.black[600],
    fontSize: 15,
    fontWeight: '500'
  },
  flex: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  }
});
