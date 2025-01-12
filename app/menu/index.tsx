import MenuHeader from '@/components/organisms/headers/MenuHeader';
import MenuTemplate from '@/components/templates/MenuTemplate';
import theme from '@/constants/theme';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

const Page = () => {
  return (
    <>
      <Stack.Screen
        options={{
          header: () => <MenuHeader />,
          animation: 'fade_from_bottom',
          animationDuration: 100
        }}
      />

      <View style={styles.container}>
        <MenuTemplate />
      </View>
    </>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
    flex: 1
  }
});
