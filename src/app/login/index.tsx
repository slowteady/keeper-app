import { Kakao } from '@/components/atoms/icons/etc';
import theme from '@/constants/theme';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Page = () => {
  return (
    <View style={styles.container}>
      <View style={[styles.cFlex, { marginBottom: 48 }]}>
        <Text style={styles.title}>소셜 로그인</Text>
        <Text style={styles.subTitle}>소셜로그인으로 Keeper와 함께하세요.</Text>
      </View>

      <View style={styles.cFlex}>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#FEE500' }]} activeOpacity={0.6}>
          <Kakao width={24} height={24} />
          <Text style={[styles.buttonText]}>Login with Kakao</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#03C75A' }]} activeOpacity={0.6}>
          <Text style={[styles.buttonText, { color: theme.colors.white[900] }]}>네이버로 시작하기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#FFFFFF' }]} activeOpacity={0.6}>
          <Text style={[styles.buttonText, { color: theme.colors.black[900], opacity: 0.54 }]}>구글로 시작하기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#000000' }]} activeOpacity={0.6}>
          <Text style={[styles.buttonText, { color: theme.colors.white[900] }]}>애플로 시작하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
    paddingTop: 56,
    paddingHorizontal: 20
  },
  cFlex: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '500',
    color: theme.colors.black[900]
  },
  subTitle: {
    fontSize: 15,
    lineHeight: 17,
    fontWeight: '400',
    color: theme.colors.black[600]
  },
  button: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 5
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 18,
    marginLeft: 18
  }
});
