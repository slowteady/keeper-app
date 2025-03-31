import Button from '@/components/atoms/button/Button';
import { Apple, Google, Kakao, Naver } from '@/components/atoms/icons/etc';
import theme from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

const Page = () => {
  return (
    <View style={styles.container}>
      <View style={[styles.cFlex, { marginBottom: 48 }]}>
        <Text style={styles.title}>Social Login</Text>
        <Text style={styles.subTitle}>소셜로그인으로 Keeper와 함께하세요.</Text>
      </View>

      <View style={styles.cFlex}>
        <Button style={[styles.button, { backgroundColor: '#FEE500' }]}>
          <View style={styles.iconWrap}>
            <Kakao width={22} height={22} color={theme.colors.black[900]} />
          </View>
          <Text style={[styles.buttonText]}>Login with Kakao</Text>
        </Button>
        <Button style={[styles.button, { backgroundColor: '#03C75A' }]}>
          <View style={styles.iconWrap}>
            <Naver width={22} height={22} />
          </View>
          <Text style={[styles.buttonText, { color: theme.colors.white[900] }]}>네이버로 시작하기</Text>
        </Button>
        <Button style={[styles.button, { backgroundColor: '#FFFFFF' }]}>
          <View style={styles.iconWrap}>
            <Google width={22} height={22} />
          </View>
          <Text style={[styles.buttonText, { color: theme.colors.black[900], opacity: 0.54 }]}>구글로 시작하기</Text>
        </Button>
        <Button style={[styles.button, { backgroundColor: '#000000' }]}>
          <View style={styles.iconWrap}>
            <Apple width={22} height={22} />
          </View>
          <Text style={[styles.buttonText, { color: theme.colors.white[900] }]}>애플로 시작하기</Text>
        </Button>
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
    position: 'relative',
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
    marginLeft: 18,
    flex: 1
  },
  iconWrap: {
    flexBasis: '30%',
    alignItems: 'flex-end'
  }
});
