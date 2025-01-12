import { NavArrowIcon } from '@/components/atoms/icons/ArrowIcon';
import { AuthIcon } from '@/components/atoms/icons/AuthIcon';
import theme from '@/constants/theme';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

const LoginMenuSection = () => {
  const handlePress = useCallback(() => {
    //
  }, []);

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <AuthIcon />
      <Text style={styles.text}>로그인</Text>
      <NavArrowIcon />
    </Pressable>
  );
};

export default LoginMenuSection;

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
