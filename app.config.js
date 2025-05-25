import 'dotenv/config';

const iosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_URL_SCHEME;

export default () => ({
  expo: {
    name: 'keeper',
    slug: 'keeper',
    version: '1.3.5',
    orientation: 'portrait',
    scheme: 'keeper',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      icon: './src/assets/images/keeper-icon.png',
      usesAppleSignIn: true,
      supportsTablet: true,
      entitlements: { 'aps-environment': 'development' },
      bundleIdentifier: 'com.keeper.love',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        CFBundleURLTypes: [{ CFBundleURLSchemes: [iosUrlScheme] }],
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true
        }
      }
    },
    android: {
      package: 'com.keeper.love',
      adaptiveIcon: { foregroundImage: './src/assets/images/keeper-android-icon.png' },
      permissions: ['android.permission.ACCESS_COARSE_LOCATION', 'android.permission.ACCESS_FINE_LOCATION']
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './src/assets/images/keeper-logo.png',
          imageWidth: 180,
          resizeMode: 'contain',
          backgroundColor: '#1FE678'
        }
      ],
      ['@mj-studio/react-native-naver-map', { client_id: process.env.EXPO_PUBLIC_CLIENT_ID }],
      [
        'expo-location',
        { locationWhenInUsePermission: '사용자의 위치를 기준으로 가까운 보호소 정보 제공을 위해 사용됩니다.' }
      ],
      [
        'expo-build-properties',
        {
          android: {
            usesCleartextTraffic: true,
            extraMavenRepos: [
              'https://repository.map.naver.com/archive/maven',
              'https://devrepo.kakao.com/nexus/content/groups/public/'
            ]
          }
        }
      ],
      [
        '@react-native-kakao/core',
        {
          nativeAppKey: process.env.EXPO_PUBLIC_KAKAO_NATIVE_KEY,
          android: { authCodeHandlerActivity: true },
          ios: { handleKakaoOpenUrl: true }
        }
      ],
      ['@react-native-seoul/naver-login', { urlScheme: 'keeper' }],
      ['@react-native-google-signin/google-signin', { iosUrlScheme }]
    ],
    experiments: { typedRoutes: true },
    extra: { eas: { projectId: '6a4a1356-b842-4472-b78e-e1bebffeb444' } }
  }
});
