# KEEPER 프로젝트 규칙

유기동물 입양 공고 앱. Expo + React Native + TypeScript.

## 아키텍처 (FSD)

계층 import 방향 (역방향 금지):

```
app → widgets → features → entities → shared
```

새 기능 스캐폴딩 순서:

```
entities → features → widgets → app
```

### 계층별 역할

- **app/**: 라우팅, features 훅 호출, widget에 props 전달
- **widgets/**: 순수 UI 섹션 컴포넌트. props만 받음, features 훅 직접 호출 금지
- **features/**: 비즈니스 로직 훅. flat 객체 반환 (`{ data, isLoading, filter, changeFilter }`)
- **entities/**: 도메인 모델. 스키마, API, 쿼리 옵션 정의
- **shared/**: 공통 리소스. API 인스턴스, 유틸, UI 컴포넌트, 외부 SDK 래퍼

## 코딩 컨벤션

- **API 응답**: 반드시 Zod 스키마로 파싱 (queryOptions의 `select`에서 수행)
- **페이지 패턴**: Hook-based Presenter — 상태와 액션을 커스텀 훅으로 분리, 화면 컴포넌트는 렌더링만
- **훅 반환 구조**: flat 객체 (`{ data, isLoading, error, login }` — 그룹핑하지 않음)
- **훅 액션 네이밍**: prefix 없이 동사만 (`login`, `logout`, `deleteUser` — `handle`/`execute` 사용 안 함). props 콜백은 `on` prefix (`onPress`, `onFilterChange`)
- **Query/API 패턴**: `queryOptions` 팩토리. entities에서 옵션 객체 정의, 사용처에서 `useQuery(options)` 호출
- **데이터 파이프라인**: fetch → Zod 파싱 (select) → hook → UI
- **엔티티 내부 파일 구조**: `schema.ts` → `api.ts` (서비스 로직 + queryOptions 팩토리)
- **테스트 파일**: co-location (소스 파일 옆에 `.test.ts`)
- **UI 컴포넌트**: `shared/ui/` 기존 컴포넌트를 참고하여 Tamagui 스타일 유지
- **외부 SDK**: `shared/api/`에 래퍼로 관리 (소셜 로그인 등)
- **API 인스턴스 구분**:
  - `authApi` — 인증 필요 요청 (토큰 자동 첨부, 401 시 갱신)
  - `publicApi` — 공개 요청
  - `kakaoApi` — Kakao Local API (주소 검색)

## Git 컨벤션

커밋 메시지: `FEAT:`, `FIX:`, `REFACTOR:`, `CHORE:`, `DOCS:`, `STYLE:`, `TEST:`

브랜치: `develop` (메인), `feature/*` (기능)

## 주의사항

- `.env` 키를 코드에 하드코딩 금지
- 토큰 저장은 반드시 `expo-secure-store`(`shared/lib/utils/handleToken.ts`) 사용
