import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View>
      <Text>{id}</Text>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({});
