import { MenuIcon } from '@/components/atoms/icons/MenuIcon';
import { SearchIcon } from '@/components/atoms/icons/SearchIcon';
import { Toggle } from '@/components/molecules/button/Toggle';
import { ANIMAL_CONF } from '@/constants/config';
import theme from '@/constants/theme';
import { useAbandonmentsContext } from '@/states/AbandonmentsProvider';
import { AnimalType } from '@/type/common';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MainHeader = memo(() => {
  const { animalType = 'ALL', setAnimalType } = useAbandonmentsContext();
  const positionTop = useSafeAreaInsets().top || 16;

  const handleChangeValue = async (value: AnimalType) => {
    setAnimalType?.(value);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handlePressMenu = async () => {
    router.push('/menu');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.wrap, { paddingTop: positionTop }]}>
        <Toggle items={ANIMAL_CONF} value={animalType} onChange={handleChangeValue} interval={4} />
        <View style={styles.rightContainer}>
          <TouchableOpacity>
            <SearchIcon />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePressMenu}>
            <MenuIcon />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export default MainHeader;

const styles = StyleSheet.create({
  container: {
    position: 'sticky',
    backgroundColor: theme.colors.background.default,
    paddingHorizontal: 20,
    paddingBottom: 16
  },
  wrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  rightContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20
  }
});

MainHeader.displayName = 'MainHeader';
