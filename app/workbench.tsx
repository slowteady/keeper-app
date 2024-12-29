import { Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

const Page = () => {
  return <SafeAreaView className="w-full h-full flex justify-center items-center"></SafeAreaView>;
};

export default Page;
