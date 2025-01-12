import { NavArrowIcon } from '@/components/atoms/icons/ArrowIcon';
import { ProfileIcon } from '@/components/atoms/icons/ProfileIcon';
import theme from '@/constants/theme';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

const MypageMenuSection = () => {
  const handlePress = useCallback(() => {
    //
  }, []);

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <ProfileIcon />
      <Text style={styles.text}>마이페이지</Text>
      <NavArrowIcon />
    </Pressable>
  );
};

export default MypageMenuSection;

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
