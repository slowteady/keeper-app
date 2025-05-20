import Button from '@/components/atoms/button/Button';
import { Google, Kakao, Naver } from '@/components/atoms/icons/etc';
import theme from '@/constants/theme';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { login } from '@react-native-kakao/user';
import NaverLogin from '@react-native-seoul/naver-login';
import {
  AppleAuthenticationButton,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationButtonType,
  AppleAuthenticationScope,
  isAvailableAsync,
  signInAsync
} from 'expo-apple-authentication';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

const Page = () => {
  const [response, setResponse] = useState('');
  const handleChange = (res: object) => {
    const text = JSON.stringify(res, null, 2);
    setResponse(text);
  };

  const handlePress = async () => {
    await Clipboard.setStringAsync(response || '');
    Alert.alert('', '복사 완료', [{ text: '확인' }]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.cFlex, { marginBottom: 48 }]}>
        <Text style={styles.title}>Social Login</Text>
        <Text style={styles.subTitle}>소셜로그인으로 Keeper와 함께하세요.</Text>
      </View>

      <View style={styles.cFlex}>
        <KakaoButton onChange={(res) => handleChange(res)} />
        <NaverButton onChange={(res) => handleChange(res)} />
        <GoogleButton onChange={(res) => handleChange(res)} />
        <AppleButton onChange={(res) => handleChange(res)} />
      </View>

      <View style={{ marginTop: 40 }}>
        <TextInput
          value={response}
          multiline
          editable={false}
          scrollEnabled
          textAlignVertical="top"
          style={{ borderWidth: 1, maxHeight: 200, marginBottom: 20 }}
        />
        <Button onPress={handlePress} style={[styles.button, { backgroundColor: theme.colors.success.main }]}>
          <Text>복사</Text>
        </Button>
      </View>
    </View>
  );
};

export default Page;

const KakaoButton = ({ onChange }: { onChange: (res: any) => void }) => {
  const handlePress = async () => {
    const response = await login();
    onChange(response);
  };

  return (
    <Button style={[styles.button, { backgroundColor: '#FEE500' }]} onPress={handlePress}>
      <View style={styles.iconWrap}>
        <Kakao width={22} height={22} color={theme.colors.black[900]} />
      </View>
      <Text style={[styles.buttonText]}>Login with Kakao</Text>
    </Button>
  );
};

const NaverButton = ({ onChange }: { onChange: (res: any) => void }) => {
  const handlePress = async () => {
    const response = await NaverLogin.login();
    onChange(response);
  };

  return (
    <Button style={[styles.button, { backgroundColor: '#03C75A' }]} onPress={handlePress}>
      <View style={styles.iconWrap}>
        <Naver width={22} height={22} />
      </View>
      <Text style={[styles.buttonText, { color: theme.colors.white[900] }]}>Login with Naver</Text>
    </Button>
  );
};

const GoogleButton = ({ onChange }: { onChange: (res: any) => void }) => {
  const handlePress = async () => {
    const isAvailable = await GoogleSignin.hasPlayServices();
    if (!isAvailable) return null;

    const response = await GoogleSignin.signIn();
    onChange(response);
  };

  return (
    <Button style={[styles.button, { backgroundColor: '#FFFFFF' }]} onPress={handlePress}>
      <View style={styles.iconWrap}>
        <Google width={22} height={22} />
      </View>
      <Text style={[styles.buttonText, { color: theme.colors.black[900], opacity: 0.54 }]}>Sign in with Google</Text>
    </Button>
  );
};

const AppleButton = ({ onChange }: { onChange: (res: any) => void }) => {
  const handlePress = async () => {
    const isAvailable = await isAvailableAsync();
    if (!isAvailable) return null;

    const response = await signInAsync({
      requestedScopes: [AppleAuthenticationScope.FULL_NAME, AppleAuthenticationScope.EMAIL]
    });
    onChange(response);
  };

  return (
    <AppleAuthenticationButton
      buttonType={AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthenticationButtonStyle.BLACK}
      style={styles.appleButton}
      cornerRadius={5}
      onPress={handlePress}
    />
  );
};

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
  appleButton: {
    width: '100%',
    height: 50
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
