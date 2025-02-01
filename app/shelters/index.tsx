import { NaverMapView } from '@mj-studio/react-native-naver-map';
import { StyleSheet, View } from 'react-native';

const Page = () => {
  return (
    <View style={{ flex: 1 }}>
      <NaverMapView style={{ flex: 1 }} />
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({});
