# Design: 운영 콘솔 (Admin Console)

## 1. 메타

- 작성일: 2026-06-19
- 상태: 초안
- 입력 PRD: docs/prd/admin-console.md
- Figma URL: 없음 — react-admin 빌트인 컴포넌트 조립 기반
- 코드베이스: 별도 레포 `keeper-admin` (Vite + react-admin SPA). keeper-app FSD 아님 → §4는 react-admin 프로젝트 구조로 대체.

## 2. 화면 목록 + 흐름

| 화면 ID | 화면명                | 진입 경로                    | 다음 화면                 |
| ------- | --------------------- | ---------------------------- | ------------------------- |
| S1      | 로그인                | 비인증 시 전 경로 리다이렉트 | S3(목록)                  |
| S2      | 콘솔 셸/레이아웃      | 인증 후 공통 프레임          | 사이드바 → S3             |
| S3      | 문의 목록             | 셸 사이드바 "문의"           | 행 클릭 → S4              |
| S4      | 문의 상세 + 답변/상태 | S3 행 클릭                   | 답변/상태 변경 후 S3 갱신 |

흐름:

```
(비인증) ──► S1 로그인 ──[카카오 OAuth + role=ADMIN]──► S3 목록
                                                          │ 행 클릭
                                                          ▼
                                                  S4 상세(원문+답변)
                                                   │ 답변 작성 / 상태 변경
                                                   └──► 저장 후 목록·상세 갱신
(role≠ADMIN)──► S1에서 차단(서버 RolesGuard 재검증)
```

react-admin `<Admin loginPage authProvider dataProvider>` + `<Resource name="inquiries">` 1개로 시작. 후속 슬라이스는 Resource 추가.

## 3. 컴포넌트 매핑

> 출처 표기: **react-admin**(빌트인) / **MUI**(@mui/material) / **신규**(keeper-admin 커스텀). keeper-app shared/ui는 다른 레포라 재활용 불가.

### S1: 로그인

컴포넌트 트리:

```
KakaoLoginPage (신규, Admin loginPage prop)
├── MUI Card / Box (중앙 정렬 레이아웃)
├── 로고/타이틀
└── KakaoLoginButton (신규) ── onClick → useLogin()({ provider: 'kakao' })
```

매핑 표:

| 컴포넌트         | 출처        | 용도                                               | 재활용 |
| ---------------- | ----------- | -------------------------------------------------- | ------ |
| `useLogin`       | react-admin | authProvider.login 호출 훅                         | 재활용 |
| KakaoLoginPage   | 신규        | 기본 id/pw 폼 대신 카카오 버튼 단독 로그인 화면    | 신규   |
| KakaoLoginButton | 신규        | 카카오 OAuth 인가 흐름 트리거(공식 버튼 가이드 룩) | 신규   |
| Card/Box         | MUI         | 중앙 정렬 컨테이너                                 | 재활용 |

### S2: 콘솔 셸/레이아웃

컴포넌트 트리:

```
<Admin layout authProvider dataProvider loginPage={KakaoLoginPage}>
└── <Resource name="inquiries" list show />
    └── <Layout> (react-admin 기본 또는 경량 커스텀)
        ├── <AppBar> (로그아웃 = react-admin 기본 UserMenu)
        ├── <Menu> (사이드바: "문의" 1개 — 후속 슬라이스 시 추가)
        └── 본문 (S3/S4 렌더 영역, 반응형)
```

매핑 표:

| 컴포넌트                                    | 출처        | 용도                                                | 재활용                           |
| ------------------------------------------- | ----------- | --------------------------------------------------- | -------------------------------- |
| `<Admin>` `<Resource>`                      | react-admin | 앱 골격·라우팅·resource 등록                        | 재활용                           |
| `<Layout>` `<AppBar>` `<Menu>` `<UserMenu>` | react-admin | 사이드바·앱바·로그아웃                              | 재활용(기본, 메뉴 항목만 커스텀) |
| `useMediaQuery`                             | MUI         | 반응형 분기(데스크톱 DataTable / 모바일 SimpleList) | 재활용                           |

### S3: 문의 목록

컴포넌트 트리:

```
<List filters={inquiryFilters} sort={{ field:'createdAt', order:'DESC' }}>
└── isSmall
    ? <SimpleList primaryText secondaryText tertiaryText />   (모바일)
    : <DataTable>                                             (데스크톱)
        ├── <DataTable.Col source="type">   → InquiryTypeBadge (신규)
        ├── <DataTable.Col source="status"> → InquiryStatusBadge (신규)
        ├── <DataTable.Col source="contentPreview">
        └── <DataTable.Col source="createdAt"> → <DateField>
```

매핑 표:

| 컴포넌트                                | 출처        | 용도                                                | 재활용 |
| --------------------------------------- | ----------- | --------------------------------------------------- | ------ |
| `<List>` `<DataTable>` `<SimpleList>`   | react-admin | 목록·표·모바일 카드                                 | 재활용 |
| `<FilterButton>`/`filters`(SelectInput) | react-admin | 상태·유형 필터                                      | 재활용 |
| `<DateField>` `<TextField>`             | react-admin | 시각·텍스트 표시                                    | 재활용 |
| InquiryStatusBadge                      | 신규        | 상태 3색 뱃지(접수=중립/처리중=notice/완료=success) | 신규   |
| InquiryTypeBadge                        | 신규        | 유형 라벨 칩(7종 한글 매핑)                         | 신규   |

### S4: 문의 상세 + 답변/상태

컴포넌트 트리:

```
<Show>
└── <SimpleShowLayout>
    ├── 원문 영역
    │   ├── InquiryTypeBadge / InquiryStatusBadge (신규)
    │   ├── <TextField source="content"> (원문)
    │   ├── <DateField source="createdAt">
    │   └── InquiryImageField (신규) — images[] 썸네일+확대
    ├── 답변 목록
    │   └── <ArrayField source="replies"> → <Datagrid>/<SingleFieldList>
    │       └── body + createdAt (운영자 답변 N건)
    └── AnswerForm (신규) — 하단 답변 작성
        ├── <SimpleForm onSubmit=useCreate(POST replies)>
        │   └── <TextInput multiline source="body">  (답변 본문)
        └── StatusAction (신규) — <SelectInput status> + useUpdate(PATCH status)
```

매핑 표:

| 컴포넌트                                               | 출처        | 용도                                                      | 재활용 |
| ------------------------------------------------------ | ----------- | --------------------------------------------------------- | ------ |
| `<Show>` `<SimpleShowLayout>`                          | react-admin | 상세 레이아웃                                             | 재활용 |
| `<ArrayField>` `<Datagrid>`/`<SingleFieldList>`        | react-admin | 답변 N건 표시                                             | 재활용 |
| `<SimpleForm>` `<TextInput multiline>` `<SelectInput>` | react-admin | 답변 입력·상태 선택                                       | 재활용 |
| `useCreate` / `useUpdate` / `useDataProvider`          | react-admin | 비표준 엔드포인트(POST replies / PATCH status) 호출       | 재활용 |
| `useRecordContext`                                     | react-admin | 현재 문의 레코드 접근(커스텀 필드)                        | 재활용 |
| InquiryImageField                                      | 신규        | images[] 썸네일 그리드 + 클릭 확대                        | 신규   |
| AnswerForm                                             | 신규        | Show 하단 답변 작성 + 저장 시 상태 완료 전이(백엔드 자동) | 신규   |
| StatusAction                                           | 신규        | 상태 수동 전이 select/버튼                                | 신규   |

### 신규 컴포넌트 사유

- **KakaoLoginPage / KakaoLoginButton**: react-admin 기본 로그인은 id/pw 폼 → 카카오 OAuth 단독 버튼으로 대체해야 함. `loginPage` prop + `useLogin`으로 교체.
- **InquiryStatusBadge / InquiryTypeBadge**: react-admin에 도메인 상태/유형 뱃지 없음. 앱(keeper-app)의 뱃지는 다른 레포라 재사용 불가 → keeper-admin에 경량 재작성(라벨·색 매핑만).
- **InquiryImageField**: 문의 첨부 이미지(R2 URL 배열) 썸네일+확대 표시. react-admin 기본 ImageField로 배열·확대까지는 부족해 커스텀.
- **AnswerForm / StatusAction**: 답변은 inquiry 리소스의 표준 edit이 아니라 하위 리소스 POST(`/replies`)·상태 PATCH라 표준 `<Edit>` 미적합 → `useCreate`/`useUpdate`로 커스텀 폼/액션.

## 4. 프로젝트 구조 매핑 (keeper-admin, react-admin 관례)

> FSD 아님. react-admin SPA의 통상 구조.

| 컴포넌트/모듈                        | 위치(예)                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| 앱 진입 `<Admin>`                    | `src/App.tsx`                                                                |
| authProvider(카카오 OAuth·role 검증) | `src/providers/authProvider.ts`                                              |
| dataProvider(NestJS REST 매핑)       | `src/providers/dataProvider.ts`                                              |
| 로그인 화면                          | `src/auth/KakaoLoginPage.tsx`, `KakaoLoginButton.tsx`                        |
| 문의 리소스                          | `src/resources/inquiries/{List,Show,AnswerForm,StatusAction}.tsx`            |
| 공통 표시                            | `src/components/{InquiryStatusBadge,InquiryTypeBadge,InquiryImageField}.tsx` |
| 상수(유형·상태 라벨)                 | `src/constants/inquiry.ts`                                                   |

후속 슬라이스(신고 등)는 `src/resources/<name>/` 추가 + `<Resource>` 등록.

## 5. 의존성

- 라이브러리(신규 레포라 전부 신규): `react-admin`, `@mui/material`(react-admin 의존), `ra-data-simple-rest` 또는 커스텀 dataProvider, Vite, 카카오 JS SDK(또는 OAuth 리다이렉트), React Query(react-admin 내장).
- 다른 슬라이스 영향: 없음(별도 레포). keeper-backend에 웹 OAuth 콜백 + CORS allowlist 추가 필요(→ /spec).
- 선행 작업: keeper-backend 웹 카카오 OAuth 경로(미구현). inquiry admin API 3개는 완비.

## 6. ADR + Open Issues

### 결정 기록

| 결정             | 옵션                                    | 채택                                                   | 사유                                                                              |
| ---------------- | --------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| 답변 입력 위치   | 별도 Edit 화면 vs Show 하단 폼          | Show 하단 AnswerForm                                   | 운영자가 원문·기존 답변을 보며 바로 답함. 답변=하위리소스 POST라 표준 Edit 부적합 |
| 답변/상태 호출   | 표준 CRUD vs useCreate/useUpdate 커스텀 | 커스텀(useCreate POST replies, useUpdate PATCH status) | 비표준 엔드포인트라 resource 표준 동작에 안 맞음                                  |
| 목록 모바일 대응 | 항상 DataTable vs useMediaQuery 분기    | useMediaQuery → SimpleList                             | react-admin 공식 반응형 패턴, 모바일 표 가독성                                    |
| 상태/유형 뱃지   | react-admin 기본 vs 신규                | 신규(경량)                                             | 도메인 뱃지 없음, 앱 뱃지는 타 레포라 재사용 불가                                 |
| 로그인 화면      | 기본 id/pw vs 카카오 버튼               | 카카오 버튼(loginPage 교체)                            | 소셜 전용·웹 카카오 OAuth 결정 반영                                               |

### Open Issues (→ /spec/구현에서 확정)

- TBD — dataProvider 구현: `ra-data-simple-rest` 가공 vs 완전 커스텀. 기존 `GET /admin/inquiries`(PageV2: total/page/size/hasNext) 응답을 react-admin이 기대하는 형식(`{ data, total }` + `Content-Range`/페이지 파라미터)으로 매핑하는 방식.
- TBD — authProvider: 카카오 OAuth 토큰 → keeper JWT 저장(localStorage/httpOnly) 및 `getIdentity`/`checkAuth`에서 role=ADMIN 확인 방식(/spec의 OAuth 방식 결정에 종속).
- TBD — InquiryImageField 확대 뷰어(MUI Dialog vs 라이브러리).

## 참고

- PRD: `docs/prd/admin-console.md`
- 백로그: `docs/backlog/admin-console.md`
- 외부 UI BP: [react-admin Show/Fields/Security 문서](https://marmelab.com/react-admin/) · [반응형 useMediaQuery](https://github.com/marmelab/react-admin/blob/master/docs/useMediaQuery.md) · [커스텀 LoginPage](https://github.com/marmelab/react-admin/blob/master/docs/SecurityGuide.md)
- Figma: 없음
