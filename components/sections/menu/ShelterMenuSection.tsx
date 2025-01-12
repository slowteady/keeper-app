import { NavArrowIcon } from '@/components/atoms/icons/ArrowIcon';
import { LocationIcon } from '@/components/atoms/icons/LocationIcon';
import theme from '@/constants/theme';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

const ShelterMenuSection = () => {
  const handlePress = useCallback(() => {
    //
  }, []);

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <LocationIcon />
      <Text style={styles.text}>지역별 보호소 & 공고</Text>
      <NavArrowIcon />
    </Pressable>
  );
};

export default ShelterMenuSection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center'
  },
  text: {
    color: theme.colors.black[800],
    fontSize: 17,
    fontWeight: 500,
    flex: 1,
    paddingLeft: 24
  }
});
