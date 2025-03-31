import Button from '@/components/atoms/button/Button';
import { LeftLineArrow } from '@/components/atoms/icons/mini';
import { Home } from '@/components/atoms/icons/outline';
import theme from '@/constants/theme';
import { useLayout } from '@/hooks/useLayout';
import { StackActions } from '@react-navigation/native';
import { router, useNavigationContainerRef } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

const DetailHeader = () => {
  const rootNavigation = useNavigationContainerRef();
  const { top } = useLayout();

  const handlePressBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };
  const handlePressHome = () => {
    rootNavigation.dispatch(StackActions.popToTop());
    router.replace('/');
  };

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <Button onPress={handlePressBack}>
        <LeftLineArrow width={24} height={24} />
      </Button>

      <View style={styles.rightContainer}>
        <Button onPress={handlePressHome}>
          <Home width={24} height={24} />
        </Button>
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
