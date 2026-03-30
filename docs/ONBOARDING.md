# KEEPER - 프로젝트 온보딩 가이드

## 1. 프로젝트 소개

**KEEPER**는 유기동물 입양에 관심 있는 사람들이 더 쉽고 빠르게 정보를 접할 수 있도록 도움을 주는 모바일 앱입니다.

- **프로젝트 기간**: 2024.05 ~
- **현재 버전**: v1.3.17
- **배포 상태**: iOS App Store, Google Play 배포 완료
- **메인 브랜치**: `develop`

---

## 2. 왜 시작했는가

유기동물 입양 정보가 여러 곳에 산재되어 있어, 관심 있는 사용자가 쉽게 접근하기 어려운 문제를 해결하기 위해 시작되었습니다. 공공 API(유기동물 입양 공고)를 활용하여 입양 공고, 보호소 정보를 한 곳에 모아 제공하고, 커뮤니티를 통해 사용자 간 소통을 지원합니다.

---

## 3. 팀 구성

| 역할                         | 인원 | 담당                                                        |
| ---------------------------- | ---- | ----------------------------------------------------------- |
| **프론트엔드 개발자 (리드)** | 1명  | 팀 구성, 기획, 앱 개발, 스토어 배포 관리, 운영 (기여도 70%) |
| **백엔드 개발자**            | 1명  | AWS, NestJS, MySQL 기반 API 서버                            |
| **디자이너**                 | 1명  | UI/UX 디자인                                                |

---

## 4. 주요 기능

### 핵심 기능

- **입양 공고**: 유기동물 입양 공고 리스트 및 상세 조회, 지역/동물 종류 필터링
- **보호소**: 보호소 정보 확인, 네이버 지도 표시, 연락처 복사, 거리 계산
- **커뮤니티**: 입양/생활/QnA 카테고리별 피드, 게시물 작성, 댓글
- **프로필**: 사용자 정보, 찜한 공고, 내 게시물 관리

### 인증

- 소셜 로그인: Google, Apple, Kakao, Naver
- JWT 토큰 기반 (Access + Refresh), expo-secure-store로 안전 저장
- 자동 토큰 갱신 (콜백 주입 패턴 인터셉터)

---

## 5. 기술 스택

### Frontend (이 저장소)

| 카테고리            | 기술                                  | 버전    |
| ------------------- | ------------------------------------- | ------- |
| **런타임**          | React Native                          | 0.81.5  |
| **플랫폼**          | Expo (Dev Client)                     | ~54.0   |
| **라우팅**          | Expo Router (파일 기반)               | ~6.0    |
| **언어**            | TypeScript                            | ^5.3    |
| **서버 상태**       | TanStack Query                        | ^5.62   |
| **클라이언트 상태** | Jotai (원자적 상태관리)               | ^2.11   |
| **UI 프레임워크**   | Tamagui                               | 1.144.4 |
| **폼**              | React Hook Form + @hookform/resolvers | ^7.55   |
| **검증**            | Zod                                   | ^4.1    |
| **HTTP**            | Axios                                 | ^1.10   |
| **지도**            | react-native-naver-map                | 2.7.0   |
| **리스트**          | @shopify/flash-list                   | 2.0.2   |
| **바텀시트**        | @gorhom/bottom-sheet                  | 5.2.8   |
| **애니메이션**      | Lottie, Reanimated 4                  | -       |
| **에러 모니터링**   | Sentry                                | ^7.2    |
| **빌드/배포**       | EAS Build & Update                    | -       |

### Backend (별도 저장소)

- AWS, NestJS, MySQL
- API Base URL: `https://app.our-keeper.com/api`

---

## 6. 프로젝트 구조 (FSD 아키텍처)

Feature-Sliced Design 기반의 계층 구조를 따릅니다. 상세 컨벤션은 `docs/fsd-convention.md` 참조.

```
src/
├── app/                    # [Layer 1] 라우팅 & 엔트리
│   ├── _layout.tsx         # 루트 레이아웃 (Provider 구성)
│   ├── index.tsx           # → /home 리다이렉트
│   ├── (tabs)/             # 탭 네비게이션 그룹
│   │   ├── home/           # 홈 화면
│   │   ├── adopt/          # 입양공고 리스트
│   │   ├── shelter/        # 보호소 리스트
│   │   ├── community/      # 커뮤니티 피드
│   │   └── profile/        # 프로필
│   └── (untabs)/           # 탭 없는 화면들
│       ├── (auth)/         # 로그인 필요 화면 (닉네임, 탈퇴)
│       ├── (unauth)/       # 비로그인 화면 (로그인, 회원가입, 약관)
│       ├── adopt/[id]/     # 입양공고 상세
│       ├── shelter/[id]/   # 보호소 상세
│       ├── community/[id]/ # 게시물 상세
│       └── community/write/# 게시물 작성
│
├── features/               # [Layer 2] 비즈니스 로직 (훅)
│   ├── auth/               # 로그인/회원가입/로그아웃
│   ├── common/             # 공통 features (좋아요 등)
│   ├── comment/            # 댓글 CRUD
│   ├── profile/            # 프로필 수정
│   ├── address/            # 주소 검색 (Kakao API)
│   └── community/          # 커뮤니티 피드/상세/작성
│       ├── list/
│       ├── detail/
│       └── create/
│
├── entities/               # [Layer 3] 도메인 모델 (스키마, API, 쿼리)
│   ├── adopt/              # 입양공고 엔티티
│   ├── auth/               # 인증 엔티티
│   ├── comment/            # 댓글 엔티티
│   ├── profile/            # 프로필 엔티티
│   ├── shelter/            # 보호소 엔티티
│   └── community/          # 커뮤니티 엔티티
│       └── model/
│           ├── schema.ts   # Zod 스키마
│           └── api.ts      # 서비스 함수 + queryOptions 팩토리
│
├── widgets/                # [Layer 4] 순수 UI 섹션 컴포넌트 (props only)
│   ├── home-section/
│   ├── adopt-section/
│   ├── shelter-section/
│   ├── community-*-section/
│   └── profile/
│
├── shared/                 # [Layer 5] 공유 리소스
│   ├── api/
│   │   ├── instance.ts     # Axios 인스턴스 (authApi, publicApi, kakaoApi)
│   │   ├── interceptors.ts # 토큰 갱신 인터셉터 (콜백 주입 패턴)
│   │   ├── schema.ts       # 공통 응답 스키마 (apiResponseSchema, pageResponseSchema)
│   │   └── socialAuth.ts   # 소셜 로그인 SDK 래퍼
│   ├── lib/utils/
│   │   ├── handleToken.ts  # 토큰 저장/조회 (Secure Store)
│   │   ├── handleError.ts  # 에러 핸들링 + Sentry
│   │   ├── validation.ts   # 유효성 검사 유틸
│   │   └── format.ts       # 포맷팅 유틸
│   ├── model/              # 공통 상수, 훅, 타입
│   ├── test/               # 테스트 유틸 (createWrapper 등)
│   └── ui/                 # 공통 UI 컴포넌트
│       ├── button/
│       ├── form/
│       ├── layout/         # SafeScreen, HeaderLayout, BottomNavigation
│       ├── overlay/        # Modal, BottomSheet
│       ├── icons/          # SVG 아이콘 (SVGR 생성)
│       └── data-display/
│
└── assets/                 # 정적 리소스
    ├── images/
    ├── icons/              # SVG 원본 (→ shared/ui/icons로 변환)
    ├── fonts/              # Pretendard
    └── animations/         # Lottie JSON
```

---

## 7. 핵심 아키텍처 패턴

### 데이터 흐름

```
화면 (app/)
  → features/hooks (useQuery, useMutation)
    → entities/model/api.ts (queryOptions 팩토리)
      → shared/api/instance (Axios)
        → Backend API
```

### API 인스턴스 구분

| 인스턴스    | 용도                                           |
| ----------- | ---------------------------------------------- |
| `authApi`   | 인증 필요한 요청 (토큰 자동 첨부, 401 시 갱신) |
| `publicApi` | 공개 API 요청                                  |
| `kakaoApi`  | Kakao Local API (주소 검색)                    |

### 토큰 갱신 흐름

1. `authApi` 요청 → 401 응답
2. 인터셉터가 감지 → `refreshTokenPromise` 캐싱 체크 (중복 방지)
3. 콜백 주입된 `refreshFn` 호출 → 새 토큰 발급 & 저장
4. 원래 요청 재시도 / 실패 시 `onRefreshFailed` 콜백 (로그인 화면 이동)

### 상태 관리 전략

- **서버 상태**: TanStack Query (캐싱, 무한스크롤, 자동 갱신)
- **클라이언트 상태**: Jotai 아톰 (가벼운 전역 상태)
- **화면 상태**: URL 파라미터 (`useLocalSearchParams`) + `useState`

---

## 8. 개발 환경 설정

### 필수 도구

- Node.js v20.20.1+ (nvm)
- pnpm (패키지 매니저)
- Expo CLI
- EAS CLI (빌드/배포)

### 주요 명령어

```bash
pnpm install          # 의존성 설치 (→ 자동 prebuild)
pnpm dev              # 개발 서버 시작 (dev client)
pnpm ios              # iOS 빌드 & 실행
pnpm android          # Android 빌드 & 실행
pnpm test             # Jest 테스트 실행
pnpm lint             # ESLint 검사
pnpm format           # Prettier 포맷팅
pnpm icon             # SVG → React 컴포넌트 변환
pnpm build:ios        # EAS 프로덕션 iOS 빌드
pnpm build:android    # EAS 프로덕션 Android 빌드
```

### 환경 변수 (.env)

```
EXPO_PUBLIC_API_URL             # 백엔드 API URL
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID    # Google OAuth
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID    # Google OAuth
EXPO_PUBLIC_KAKAO_NATIVE_KEY        # Kakao 소셜 로그인
EXPO_PUBLIC_KAKAO_RESTAPI_KEY       # Kakao Local API (주소 검색)
EXPO_PUBLIC_NAVER_CLIENT_ID         # Naver 소셜 로그인
EXPO_PUBLIC_NAVER_MAPS_CLIENT_ID    # Naver 지도
EXPO_PUBLIC_SENTRY_DSN              # Sentry 에러 모니터링
EXPO_PUBLIC_APPLE_TEAM_ID           # Apple 팀 ID
```

### EAS Build 프로필

| 프로필        | 용도      | 배포                   |
| ------------- | --------- | ---------------------- |
| `development` | 개발용    | 내부 배포 (dev client) |
| `preview`     | QA/테스트 | 프리뷰 채널            |
| `production`  | 스토어    | App Store / Play Store |

---

## 9. Git 컨벤션

### 브랜치 전략

- `develop`: 메인 개발 브랜치
- `feature/*`: 기능 개발 브랜치

### 커밋 메시지 타입

```
FEAT:      새로운 기능 추가
FIX:       버그 수정
DOCS:      문서 수정
STYLE:     코드 스타일 변경 (로직 변경 없음)
REFACTOR:  코드 리팩토링
TEST:      테스트 코드 추가/수정
CHORE:     빌드, 설정 등 기타 변경
```

---

## 10. 주요 파일 바로가기

| 항목             | 경로                                  |
| ---------------- | ------------------------------------- |
| 루트 레이아웃    | `src/app/_layout.tsx`                 |
| 탭 레이아웃      | `src/app/(tabs)/_layout.tsx`          |
| API 인스턴스     | `src/shared/api/instance.ts`          |
| API 인터셉터     | `src/shared/api/interceptors.ts`      |
| 소셜 로그인 래퍼 | `src/shared/api/socialAuth.ts`        |
| 공통 응답 스키마 | `src/shared/api/schema.ts`            |
| 토큰 관리        | `src/shared/lib/utils/handleToken.ts` |
| 에러 핸들링      | `src/shared/lib/utils/handleError.ts` |
| Tamagui 설정     | `tamagui.config.ts`                   |
| Expo 설정        | `app.config.js`                       |
| EAS 설정         | `eas.json`                            |
| ESLint 설정      | `.eslintrc.cjs`                       |
| Jest 설정        | `jest.setup.ts`                       |
| FSD 컨벤션       | `docs/fsd-convention.md`              |
