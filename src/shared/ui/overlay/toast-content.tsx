import LottieView from 'lottie-react-native';
import { Text, XStack } from 'tamagui';

const ICON_CONFIG = {
  success: {
    source: require('@/assets/animations/success2.json'),
    style: { marginRight: 8, width: 32, height: 32 }
  },
  fail: {
    source: require('@/assets/animations/fail2.json'),
    style: { marginRight: 8, width: 24, height: 24 }
  }
} as const;

type ToastStatus = 'success' | 'fail';

type ToastContentProps = {
  message: string;
  status?: ToastStatus;
};

export const ToastContent = ({ message, status }: ToastContentProps) => (
  <XStack height={48} rounded="$3" items="center" justify="center" bg="$black900" px="$4" width="100%">
    {status && <LottieView autoPlay loop={false} {...ICON_CONFIG[status]} />}
    <Text fontWeight="$5" fontSize={14} color="$white900">
      {message}
    </Text>
  </XStack>
);
