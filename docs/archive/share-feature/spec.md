# Spec: 공유하기 (share) — 딥링크 · 네이티브 · 라우팅

> 입력: docs/prd/share-feature.md, docs/design/share-feature.md.
> 선행 `docs/spec/share-link.md`(OG 메타 API 계약) **유효** — 본 문서는 그 위에 딥링크 분기·네이티브 설정·라우팅을 명세. OG API 계약은 share-link.md 참조(중복 X).
> Data Model 신규 없음 — DB 마이그레이션 없음(공유 메타는 도메인 필드 파생).

## 1. 딥링크 라우팅 매핑

공유 URL path와 앱 라우트가 달라 변환이 필요하다.

| 공유 URL (universal link)                     | 커스텀 스킴               | 앱 라우트                  |
| --------------------------------------------- | ------------------------- | -------------------------- |
| `https://our-keeper.com/share/adopt/{id}`     | `keeper://adopt/{id}`     | `/(untabs)/adopt/[id]`     |
| `https://our-keeper.com/share/shelter/{id}`   | `keeper://shelter/{id}`   | `/(untabs)/shelter/[id]`   |
| `https://our-keeper.com/share/community/{id}` | `keeper://community/{id}` | `/(untabs)/community/[id]` |

### `+native-intent.tsx` (신규, `src/app/+native-intent.tsx`)

expo-router 공식 패턴. 외부 URL을 내부 라우트로 rewrite. expo-router가 화면 deep linking을 자동 처리하므로 path 변환만 책임.

```ts
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  try {
    const url = new URL(path, 'keeper://');
    // universal link(our-keeper.com/share/{type}/{id}) 와 keeper://{type}/{id} 모두 처리
    const segments = url.pathname
      .replace(/^\/(share\/)?/, '')
      .split('/')
      .filter(Boolean);
    const [type, id] = segments;
    if (id && (type === 'adopt' || type === 'shelter' || type === 'community')) {
      return `/(untabs)/${type}/${id}`;
    }
    return path;
  } catch {
    return '/';
  }
}
```

- 핸들러 위치: `src/app/+native-intent.tsx`(expo-router 규약 파일, app 디렉터리 루트).
- expo-router `typedRoutes: true` 적용 중 — 반환 path는 typed route와 정합.
- 미지원 type/형식 → 원본 path 반환(404 라우트 fallback). 절대 throw 금지.

## 2. 네이티브 config (app.config — CNG, prebuild 재빌드 필수·소급불가)

### iOS — `config/ios.cjs`

```js
associatedDomains: ['applinks:our-keeper.com'],
```

- AASA `appID` = `{EXPO_PUBLIC_APPLE_TEAM_ID}.com.keeper.love` (bundleIdentifier 일치).
- 기존 `infoPlist.CFBundleURLTypes`(구글 스킴)·`scheme: 'keeper'` 유지.

### Android — `config/android.cjs`

```js
intentFilters: [{
  action: 'VIEW',
  autoVerify: true,
  data: [{ scheme: 'https', host: 'our-keeper.com', pathPrefix: '/share' }],
  category: ['BROWSABLE', 'DEFAULT']
}],
```

- `package` = `com.keeper.love`(기존).

## 3. keeper-web `.well-known` + 착지 (별도 레포 — 계약/경로만)

### `public/.well-known/apple-app-site-association` (확장자·Content-Type application/json)

```json
{ "applinks": { "apps": [], "details": [{ "appID": "{APPLE_TEAM_ID}.com.keeper.love", "paths": ["/share/*"] }] } }
```

### `public/.well-known/assetlinks.json`

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.keeper.love",
      "sha256_cert_fingerprints": ["<릴리즈 서명 SHA256>"]
    }
  }
]
```

- `/share/[type]/[id]` 라우트 `generateMetadata` + 착지 UI(design 화면2). API 실패/404/이미지없음 → 로고+기본설명 fallback.

## 4. Backend `GET /shares/:type/:id` (별도 레포 — share-link.md 계약 재확인)

- public, 부작용 없음(조회수·인증·연락처 X). 숨김 community/없는 대상 → `NOT_FOUND`.
- 응답 `ShareMetadata { type, id, title, description, imageUrl, appPath }`.
- type별 매핑(share-link.md): adopt=품종·성별·나이/대표사진, shelter=명·주소/null(로고 fallback은 web), community=제목·본문120/첫이미지·**연락처 제외**.
- `appPath`: 앱 내부 경로 문자열(웹 착지의 "앱으로 열기" CTA가 `keeper://{appPath}` 또는 universal link 구성에 사용). 매핑은 §1과 일치.

## 5. 스키마 3중 검증 (share-link.md 표 재확인 — 변경 없음)

| 필드        | keeper-app(zod)             | keeper-web     | keeper-backend | DB               | 일치 |
| ----------- | --------------------------- | -------------- | -------------- | ---------------- | ---- |
| type        | `adopt\|shelter\|community` | 동일           | 동일           | 파생             | ✅   |
| id          | string                      | string         | string         | PK               | ✅   |
| title       | 전송안함                    | API응답        | string         | 파생             | ✅   |
| description | 전송안함                    | API응답        | string         | 파생             | ✅   |
| imageUrl    | 전송안함                    | `string\|null` | `string\|null` | JSON 첫항목/null | ✅   |
| appPath     | 전송안함                    | string         | string         | 파생             | ✅   |

- 딥링크 라우팅(§1)은 클라 path 변환 — 스키마 무관. 앱은 `/share/{type}/{id}` URL만 공유, token 미생성(share-link.md ADR).

## 6. 테스트 시나리오

- **설치자 universal link**: Given 앱 설치 + AASA 검증됨, When `our-keeper.com/share/adopt/123` 탭, Then `+native-intent` → `/(untabs)/adopt/123` 진입(브라우저 안 거침).
- **커스텀 스킴**: When `keeper://community/45`, Then `/(untabs)/community/45` 진입.
- **path 매핑 정합**: 3 type × redirectSystemPath → 올바른 라우트. 미지원 type → 원본 반환(throw X).
- **미설치자 fallback**: Given 앱 미설치, When 동일 링크, Then 브라우저가 `/share/adopt/123` 착지(프리뷰+CTA+Smart Banner).
- **OG fallback**: API 404/이미지없음 → keeper 로고 + 기본 설명.
- **딥링크 안정성**: 잘못된 URL/빈 segment → `redirectSystemPath` throw 없이 `/` 반환.

## 7. 변경 파일 (구현 단계 입력)

keeper-app:

- `src/app/+native-intent.tsx` (신규)
- `config/ios.cjs` (associatedDomains 추가)
- `config/android.cjs` (intentFilters 추가)
- 공유 진입점·`useShare`: 변경 없음(기구현). community 헤더: 변경 없음(FR6 no-op).

keeper-web(별도): `.well-known/aasa`·`assetlinks.json`, `/share/[type]/[id]` 라우트.
keeper-backend(별도): `GET /shares/:type/:id`(share-link.md 계약).

## 8. ADR

- **`+native-intent` redirectSystemPath 채택**: expo-router 공식 외부 URL rewrite 훅. universal link·커스텀 스킴 단일 핸들러로 처리, 화면별 라우팅 재구성 불필요(expo-router 자동 deep linking).
- **딥링크 path 변환 클라 책임**: 공유 URL(`/share/*`)과 앱 라우트(`/(untabs)/*`) 분리 유지(웹 SEO/OG 경로 ≠ 앱 내부 구조). 변환은 클라 1곳(`+native-intent`).
- **AASA appID env 의존**: `APPLE_TEAM_ID`는 env. well-known 파일 생성 시 주입.
- **네이티브 재빌드**: associatedDomains/intentFilters는 CNG. 이번 빌드 포함 필수(소급불가) — share-link.md/PRD Rollout과 정합.

## 9. Open Issues

- assetlinks `sha256_cert_fingerprints`: 릴리즈 서명 키 지문 확보 필요(EAS credentials).
- `type:'app'` 공유(`our-keeper.com` 루트)는 §1 매핑 대상 아님 — 루트 착지(현행 유지).
- appPath를 클라가 쓸지(웹 CTA만 쓸지) — 웹 착지 "앱으로 열기"가 universal link 자체로 충분하면 appPath는 web 전용.
