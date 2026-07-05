const kakaoNativeKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_KEY;
const googleIosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_URL_IOS_SCHEME;

if (process.env.EAS_BUILD && (!kakaoNativeKey || !googleIosUrlScheme)) {
  throw new Error(
    '[plugins] EAS 빌더 환경변수 누락: EXPO_PUBLIC_KAKAO_NATIVE_KEY / EXPO_PUBLIC_GOOGLE_URL_IOS_SCHEME (production environment 확인)'
  );
}

module.exports = [
  'expo-font',
  'expo-web-browser',
  'expo-router',
  'expo-apple-authentication',
  [
    'expo-splash-screen',
    {
      image: './src/assets/images/keeper-logo.png',
      imageWidth: 180,
      resizeMode: 'contain',
      backgroundColor: '#1FE678'
    }
  ],
  ['@mj-studio/react-native-naver-map', { client_id: process.env.EXPO_PUBLIC_NAVER_MAPS_CLIENT_ID }],
  [
    'expo-location',
    { locationWhenInUsePermission: '사용자의 위치를 기준으로 가까운 보호소 정보 제공을 위해 사용됩니다.' }
  ],
  [
    'expo-image-picker',
    {
      photosPermission: '게시글 및 프로필 사진·동영상 업로드를 위해 사진 라이브러리 접근 권한이 필요합니다.',
      cameraPermission: '프로필 사진 촬영을 위해 카메라 접근 권한이 필요합니다.'
    }
  ],
  'expo-video',
  'react-native-compressor',
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
      nativeAppKey: kakaoNativeKey ?? 'PLACEHOLDER_KAKAO_NATIVE_KEY',
      android: { authCodeHandlerActivity: true },
      ios: { handleKakaoOpenUrl: true }
    }
  ],
  [
    '@react-native-google-signin/google-signin',
    { iosUrlScheme: googleIosUrlScheme ?? 'com.googleusercontent.apps.placeholder' }
  ],
  'react-native-map-link',
  './config/with-korean-map-queries.cjs',
  './config/with-modular-headers.cjs',
  [
    'expo-secure-store',
    {
      usesNonExemptEncryption: false,
      configureAndroidBackup: true,
      faceIDPermission: 'Keeper가 안전한 저장소를 사용할 수 있도록 허용해 주세요.'
    }
  ],
  [
    '@sentry/react-native/expo',
    {
      organization: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT
    }
  ],
  [
    'expo-notifications',
    {
      defaultChannel: 'default'
    }
  ]
];
