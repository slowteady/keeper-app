import { LeftLineArrow } from '@/shared/components/atoms/icons/mini';
import { Home } from '@/shared/components/atoms/icons/outline';
import { theme } from '@/shared/constants/theme.constants';
import { useLayout } from '@/shared/hooks/useLayout';
import { StackActions } from '@react-navigation/native';
import { router, useNavigationContainerRef } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { Button } from '../atoms/Button';

export interface DetailHeaderProps {
  rightHeader?: React.ReactNode;
}

export const DetailHeader = ({ rightHeader }: DetailHeaderProps) => {
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
        <LeftLineArrow width={24} height={24} color={theme.colors.black[900]} />
      </Button>

      <View style={styles.rightContainer}>
        {rightHeader || (
          <Button onPress={handlePressHome}>
            <Home width={24} height={24} color={theme.colors.black[900]} />
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
