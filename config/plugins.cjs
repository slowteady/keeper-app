module.exports = [
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
  ['@mj-studio/react-native-naver-map', { client_id: process.env.EXPO_PUBLIC_NAVER_MAPS_CLIENT_ID }],
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
  ['@react-native-google-signin/google-signin', { iosUrlScheme: process.env.EXPO_PUBLIC_GOOGLE_URL_SCHEME }]
];
