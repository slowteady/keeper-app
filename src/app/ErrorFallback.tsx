import Button from '@/components/atoms/button/Button';
import MainHeader from '@/components/organisms/headers/MainHeader';
import theme from '@/constants/theme';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

const ErrorFallback = ({ error, resetError }: ErrorFallbackProps) => {
  const handleRetry = () => {
    resetError();
  };

  return (
    <View style={{ flex: 1 }}>
      <MainHeader useDrawer={false} />

      <View style={styles.container}>
        <Image source={require('@/assets/images/error.png')} style={styles.image} contentFit="contain" />
        <Text style={styles.titleText}>인터넷이 연결되어 있지 않아요</Text>
        <Text style={styles.descriptionText}>{`Wi-fi 또는 셀룰러 데이터 연결을 확인한 후\n다시 시도해 주세요.`}</Text>
        <Button style={styles.button} onPress={handleRetry}>
          <Text style={styles.buttonText}>다시시도</Text>
        </Button>
      </View>
    </View>
  );
};

export default ErrorFallback;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    width: 120,
    height: 100,
    marginBottom: 40
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
    color: theme.colors.black[900],
    marginBottom: 12
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
    color: theme.colors.black[900],
    marginBottom: 48
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: theme.colors.black[900],
    borderRadius: 60
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 16,
    color: theme.colors.white[900]
  }
});
