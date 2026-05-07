jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({})),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    setParams: jest.fn()
  })),
  usePathname: jest.fn(() => '/'),
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    setParams: jest.fn(),
    dismiss: jest.fn(),
    dismissAll: jest.fn(),
    navigate: jest.fn()
  }
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' }
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  useForegroundPermissions: jest.fn(() => [
    { status: 'granted' },
    jest.fn(() => Promise.resolve({ status: 'granted' }))
  ]),
  getForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({ coords: { latitude: 37.5665, longitude: 126.978 } })),
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied', UNDETERMINED: 'undetermined' }
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: true, assets: [] }))
}));

jest.mock('expo-image-manipulator', () => {
  const saveAsync = jest.fn(() =>
    Promise.resolve({
      uri: 'file:///mock/manipulated.jpg',
      width: 800,
      height: 800,
      base64: null
    })
  );
  const renderAsync = jest.fn(() => Promise.resolve({ saveAsync, width: 800, height: 800 }));
  const ctx = {
    crop: jest.fn().mockReturnThis(),
    resize: jest.fn().mockReturnThis(),
    rotate: jest.fn().mockReturnThis(),
    flip: jest.fn().mockReturnThis(),
    extent: jest.fn().mockReturnThis(),
    reset: jest.fn().mockReturnThis(),
    renderAsync
  };
  return {
    ImageManipulator: {
      manipulate: jest.fn(() => ctx)
    },
    SaveFormat: { JPEG: 'jpeg', PNG: 'png', WEBP: 'webp' }
  };
});

jest.mock('expo-store-review', () => ({
  requestReview: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true))
}));

jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(false))
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    hasPlayServices: jest.fn(() => Promise.resolve(false)),
    signIn: jest.fn(),
    configure: jest.fn()
  }
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: jest.fn(),
  usePreventRemove: jest.fn()
}));

jest.mock('sonner-native', () => ({
  toast: {
    custom: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    dismiss: jest.fn()
  },
  Toaster: () => null
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
  SafeAreaProvider: ({ children }: any) => children
}));

jest.mock('react-native-reanimated', () => ({
  default: { addWhitelistedNativeProps: jest.fn() },
  useSharedValue: jest.fn((init: any) => ({ value: init })),
  useAnimatedStyle: jest.fn((fn: any) => fn()),
  useAnimatedProps: jest.fn((fn: any) => fn()),
  withTiming: jest.fn((val: any) => val),
  withSpring: jest.fn((val: any) => val),
  interpolateColor: jest.fn(() => 'transparent'),
  Easing: { out: jest.fn(() => jest.fn()), exp: jest.fn() },
  runOnJS: jest.fn((fn: any) => fn),
  createAnimatedComponent: (component: any) => component
}));

jest.mock('@react-native-kakao/user', () => ({
  login: jest.fn()
}));

jest.mock('@react-native-kakao/core', () => ({
  initializeKakaoSDK: jest.fn()
}));

jest.mock('@react-native-seoul/naver-login', () => ({
  default: { initialize: jest.fn(), login: jest.fn() }
}));

jest.mock('@mj-studio/react-native-naver-map', () => ({}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: any) => children,
  GestureDetector: ({ children }: any) => children,
  Gesture: { Tap: jest.fn(() => ({ onEnd: jest.fn().mockReturnThis(), runOnJS: jest.fn().mockReturnThis() })) },
  Swipeable: ({ children }: any) => children,
  DrawerLayout: ({ children }: any) => children,
  State: {},
  PanGestureHandler: ({ children }: any) => children,
  TapGestureHandler: ({ children }: any) => children,
  FlingGestureHandler: ({ children }: any) => children,
  ForceTouchGestureHandler: ({ children }: any) => children,
  LongPressGestureHandler: ({ children }: any) => children,
  NativeViewGestureHandler: ({ children }: any) => children,
  PinchGestureHandler: ({ children }: any) => children,
  RotationGestureHandler: ({ children }: any) => children,
  ScrollView: ({ children }: any) => children,
  Slider: ({ children }: any) => children,
  Switch: ({ children }: any) => children,
  TextInput: ({ children }: any) => children,
  ToolbarAndroid: ({ children }: any) => children,
  ViewPagerAndroid: ({ children }: any) => children,
  DrawerLayoutAndroid: ({ children }: any) => children,
  WebView: ({ children }: any) => children,
  NativeEventEmitter: () => null,
  TouchableHighlight: ({ children }: any) => children,
  TouchableNativeFeedback: ({ children }: any) => children,
  TouchableOpacity: ({ children }: any) => children,
  TouchableWithoutFeedback: ({ children }: any) => children,
  Directions: {}
}));

jest.mock('@gorhom/bottom-sheet', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
  BottomSheetView: ({ children }: any) => children,
  BottomSheetModal: ({ children }: any) => children,
  BottomSheetModalProvider: ({ children }: any) => children,
  BottomSheetBackdrop: () => null,
  BottomSheetTextInput: () => null
}));

jest.mock('react-native-keyboard-controller', () => ({
  KeyboardAvoidingView: ({ children }: any) => children,
  KeyboardProvider: ({ children }: any) => children,
  KeyboardStickyView: ({ children }: any) => children
}));

jest.mock('@/shared/lib', () => ({
  ...jest.requireActual('@/shared/lib'),
  getAccessToken: jest.fn(() => Promise.resolve('mock-token')),
  removeToken: jest.fn(() => Promise.resolve()),
  saveAccessToken: jest.fn(() => Promise.resolve()),
  saveRefreshToken: jest.fn(() => Promise.resolve()),
  setUserContext: jest.fn(),
  clearUserContext: jest.fn()
}));

jest.mock('@/shared/api/instance', () => ({
  publicApi: { get: jest.fn(), post: jest.fn(), delete: jest.fn(), patch: jest.fn(), put: jest.fn() },
  authApi: { get: jest.fn(), post: jest.fn(), delete: jest.fn(), patch: jest.fn(), put: jest.fn() },
  kakaoApi: { get: jest.fn() }
}));

jest.mock('@/shared/ui', () => ({
  ...jest.requireActual('@/shared/ui'),
  useBottomSheet: jest.fn(() => ({ present: jest.fn(), dismiss: jest.fn() })),
  useModal: jest.fn(() => ({ open: jest.fn(), close: jest.fn() }))
}));
