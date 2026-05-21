# Library Catalog — keeper-app 서드파티 컴포넌트/훅 가이드

`/design` 단계에서 신규 컴포넌트 직접 짜기 전에 먼저 확인. 헛돌이 방지.

새 라이브러리 추가하거나 자주 쓰는 export 변경되면 이 문서도 같이 갱신.
기준일: 2026-05-21 / keeper-app package.json.

---

## UI 기본 — tamagui

> 모든 레이아웃·텍스트·뷰의 1차 도구. `react-native` 의 View/Text 보다 우선.

| Export                      | 용도                                                              |
| --------------------------- | ----------------------------------------------------------------- |
| `Stack`, `XStack`, `YStack` | flex container (가로/세로)                                        |
| `View`                      | 일반 박스                                                         |
| `Text`                      | 텍스트 + 토큰 컬러/사이즈                                         |
| `Button`                    | tamagui 기본 버튼 (keeper 는 `shared/ui/button/Button` 래핑 사용) |
| `styled`                    | variant 기반 컴포넌트 정의                                        |
| `useTheme`                  | 테마 토큰 접근                                                    |

플러스 `@tamagui/lucide-icons`, `@tamagui/toast`.

---

## BottomSheet — `@gorhom/bottom-sheet`

> BottomSheet 안에서는 **반드시 gorhom 의 wrapper 사용**. react-native 의 Pressable / ScrollView / TextInput 그대로 쓰면 gesture 충돌.

| Export                                                                   | 용도                                  |
| ------------------------------------------------------------------------ | ------------------------------------- |
| `BottomSheet`, `BottomSheetModal`                                        | 시트 본체                             |
| `BottomSheetScrollView`, `BottomSheetFlatList`, `BottomSheetSectionList` | 시트 안 스크롤                        |
| `BottomSheetTextInput`                                                   | 시트 안 인풋 (키보드 처리됨)          |
| `TouchableOpacity`, `TouchableHighlight`, `TouchableWithoutFeedback`     | 시트 안 탭 핸들러 (RN Pressable 대용) |
| `BottomSheetBackdrop`                                                    | 배경 흐림                             |
| `BottomSheetFooter`, `useBottomSheetInternal`                            | sticky footer                         |

---

## 키보드 — `react-native-keyboard-controller`

> 키보드 따라가는 footer / 인풋 자동 스크롤. RN 의 `KeyboardAvoidingView` 직접 쓰지 않음.

| Export                    | 용도                                                                    |
| ------------------------- | ----------------------------------------------------------------------- |
| `KeyboardAwareScrollView` | TextInput focus 시 자동 스크롤. `bottomOffset` 으로 여백                |
| `KeyboardStickyView`      | 키보드 위에 sticky footer (keeper `shared/ui/layout/StickyFooter` 기반) |
| `KeyboardAvoidingView`    | 기본 회피 (RN 보다 부드러움)                                            |

---

## 데이터 / 폼 / 검증

| 라이브러리                  | 핵심 export                                                 | 용도                                               |
| --------------------------- | ----------------------------------------------------------- | -------------------------------------------------- |
| `@tanstack/react-query`     | `useQuery`, `useMutation`, `queryOptions`, `useQueryClient` | API 호출. keeper 는 `<domain>Queries` factory 패턴 |
| `react-hook-form`           | `useForm`, `Controller`, `FormProvider`                     | 폼 상태                                            |
| `@hookform/resolvers` (zod) | `zodResolver`                                               | RHF + zod 통합                                     |
| `zod`                       | `z.object`, `z.string()`, ...                               | 스키마 / 런타임 검증 (keeper schema 표준)          |
| `axios`                     | `axios.create`, interceptors                                | API 인스턴스 (keeper `shared/api/instance`)        |
| `jotai`                     | `atom`, `useAtom`, `useSetAtom`                             | 글로벌 상태 (지양 — 가능하면 react-query 캐시로)   |

---

## 애니메이션 / 제스처

| 라이브러리                     | 핵심 export                                                                                                          | 용도                    |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `react-native-reanimated`      | `useSharedValue`, `useAnimatedStyle`, `withTiming`, `withSpring`, `interpolate`, `Animated.View`, `entering/exiting` | 애니메이션              |
| `react-native-gesture-handler` | `Pressable` (BottomSheet 밖), `Gesture` API                                                                          | 제스처                  |
| `react-native-worklets`        | runOnJS, ...                                                                                                         | reanimated worklet 보조 |

---

## 네비게이션 — Expo Router + React Navigation

| Export                                                                                 | 용도                                      |
| -------------------------------------------------------------------------------------- | ----------------------------------------- |
| `expo-router` — `router`, `useRouter`, `useLocalSearchParams`, `Link`, `Stack`, `Tabs` | 파일 기반 라우팅                          |
| `@react-navigation/bottom-tabs`                                                        | bottom tab (Tabs 내부에서 사용)           |
| `@react-navigation/drawer`                                                             | drawer (사용 여부 확인)                   |
| `react-native-screens`                                                                 | native stack 최적화 (Expo 가 자동 set up) |
| `react-native-safe-area-context`                                                       | `useSafeAreaInsets`, `SafeAreaView`       |

---

## 이미지 / 미디어

| 라이브러리                  | 핵심 export               | 용도                                                  |
| --------------------------- | ------------------------- | ----------------------------------------------------- |
| `expo-image`                | `Image`, `ImageSource`    | 캐시 / blurhash / contentFit 지원. RN Image 보다 우선 |
| `expo-image-picker`         | `launchImageLibraryAsync` | 갤러리                                                |
| `expo-image-manipulator`    | `manipulateAsync`         | 리사이즈 / 압축                                       |
| `react-native-zoom-toolkit` | zoom view                 | 이미지 zoom                                           |
| `react-native-svg`          | `Svg`, `Path`, ...        | SVG (keeper 아이콘)                                   |
| `lottie-react-native`       | `LottieView`              | 로티                                                  |

---

## 인증 / 외부 SDK

| 라이브러리                                  | 핵심 export                              | 용도        |
| ------------------------------------------- | ---------------------------------------- | ----------- |
| `@react-native-google-signin/google-signin` | `GoogleSignin.signIn/signOut`            | 구글 로그인 |
| `@react-native-kakao/user`                  | `login`, `logout`, `unlink`              | 카카오      |
| `@react-native-seoul/naver-login`           | `NaverLogin.login/logout`                | 네이버      |
| `expo-apple-authentication`                 | `signInAsync`, `getCredentialStateAsync` | 애플        |
| `expo-secure-store`                         | `getItemAsync`, `setItemAsync`           | 토큰 저장   |

---

## 탭 / 페이저 / 리스트

| 라이브러리                | 핵심 export         | 용도                                                |
| ------------------------- | ------------------- | --------------------------------------------------- |
| `react-native-tab-view`   | `TabView`, `TabBar` | 가로 스와이프 탭 (signup-agreement-sheet 에서 사용) |
| `react-native-pager-view` | pager               | tab-view 의존                                       |
| `@shopify/flash-list`     | `FlashList`         | 큰 리스트 (RN FlatList 보다 빠름)                   |
| `react-native-webview`    | `WebView`           | 약관 / 외부 페이지                                  |

---

## 햅틱 / OS 연동

| 라이브러리             | 핵심 export                                     | 용도                                                    |
| ---------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| `expo-haptics`         | `impactAsync(ImpactFeedbackStyle.Medium/Light)` | 토글성 액션 햅틱. **Medium=on / Light=off** (keeper 룰) |
| `expo-clipboard`       | `setStringAsync`                                | 복사                                                    |
| `expo-intent-launcher` | Android Intent                                  | 외부 앱 호출                                            |
| `expo-linking`         | `openURL`, `createURL`                          | 딥링크                                                  |
| `expo-web-browser`     | `openBrowserAsync`                              | 인앱 브라우저                                           |

---

## 토스트 / 알림

| 라이브러리      | 핵심 export                    | 용도                               |
| --------------- | ------------------------------ | ---------------------------------- |
| `sonner-native` | `toast.success`, `toast.error` | 토스트 (keeper `globalToast` 기반) |
| `burnt`         | (대안)                         | iOS 시스템 토스트                  |

---

## 모니터링

| 라이브러리             | 핵심 export                | 용도        |
| ---------------------- | -------------------------- | ----------- |
| `@sentry/react-native` | `init`, `captureException` | 에러 트래킹 |

---

## 자주 헷갈리는 매칭표

| 만들고 싶은 것                             | 직접 짜지 말고 →                             |
| ------------------------------------------ | -------------------------------------------- |
| 키보드 따라 올라가는 footer                | `KeyboardStickyView`                         |
| TextInput focus 시 키보드 위로 자동 스크롤 | `KeyboardAwareScrollView` + `bottomOffset`   |
| BottomSheet 안 탭 영역                     | `TouchableOpacity from @gorhom/bottom-sheet` |
| BottomSheet 안 인풋                        | `BottomSheetTextInput`                       |
| BottomSheet 안 스크롤                      | `BottomSheetScrollView`                      |
| 큰 리스트 (50+ 행)                         | `FlashList`                                  |
| 가로 스와이프 탭                           | `react-native-tab-view` + `TabView`          |
| 캐시되는 이미지                            | `expo-image Image`                           |
| 토글성 햅틱                                | `expo-haptics impactAsync`                   |
| 안전 영역 padding                          | `useSafeAreaInsets`                          |
| 글로벌 상태                                | (가급적 react-query 캐시. jotai 는 최후)     |
