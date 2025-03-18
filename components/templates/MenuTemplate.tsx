import theme from '@/constants/theme';
import { Platform, StyleSheet, View } from 'react-native';
import AdoptMenuSection from '../sections/menu/AdoptMenuSection';
import ShelterMenuSection from '../sections/menu/ShelterMenuSection';

const MenuTemplate = () => {
  return (
    <View style={styles.container}>
      <View style={styles.menuWrapper}>
        <AdoptMenuSection />
        <ShelterMenuSection />
        {/* <CommunityMenuSection /> */}
        {/* <AboutUsMenuSection /> */}
        {/* <LoginMenuSection /> */}
        {/* <MypageMenuSection /> */}
      </View>
    </View>
  );
};

export default MenuTemplate;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white[900],
    display: 'flex',
    flexDirection: 'column',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowRadius: 5,
        shadowColor: 'rgba(0, 0, 0, 0.20)',
        shadowOpacity: 1
      },
      android: {
        elevation: 6
      }
    })
  },
  menuWrapper: {
    paddingVertical: 48,
    gap: 32
  }
});
