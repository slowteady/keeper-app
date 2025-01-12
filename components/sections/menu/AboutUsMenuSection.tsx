import { NavArrowIcon } from '@/components/atoms/icons/ArrowIcon';
import { StarIcon } from '@/components/atoms/icons/StarIcon';
import theme from '@/constants/theme';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

const AboutUsMenuSection = () => {
  const handlePress = useCallback(() => {
    //
  }, []);

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <StarIcon />
      <Text style={styles.text}>About Us</Text>
      <NavArrowIcon />
    </Pressable>
  );
};

export default AboutUsMenuSection;

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
