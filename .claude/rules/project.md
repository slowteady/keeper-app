# 프로젝트 규칙: keeper-app

유기동물 입양 공고 앱(iOS·Android). 문서 색인은 `docs/README.md`. 여기에는 지금 지켜야 할 것만 쓴다.

## 공개 레포

- 이 레포는 공개다. 이슈, 아티팩트, PR, 커밋 메시지에 보안 결함의 내용, 운영 데이터, 사용자 정보, 키를 쓰지 않는다.
- 보안 결함은 비공개 레포 `slowteady/keeper-backend`에 이슈로 올린다. 앱 수정이 필요하면 이 레포 이슈에는 "백엔드 이슈 #N 대응"처럼 번호만 적는다.

## 구조

| 위치                                                               | 기술                                                |
| ------------------------------------------------------------------ | --------------------------------------------------- |
| `src/app/`                                                         | Expo Router 페이지 (Expo SDK 54, React Native 0.81) |
| `src/widgets/` · `src/features/` · `src/entities/` · `src/shared/` | FSD 레이어                                          |
| `.maestro/flows-ios/` · `.maestro/flows-android/`                  | E2E 흐름                                            |

- import 방향은 app → widgets → features → entities → shared만. 같은 레이어 슬라이스 간 import 금지(entities 간 예외). 자세한 배치 기준은 `docs/project-structure.md`.
- 코드 규칙은 `docs/code-conventions.md`, API 패턴은 `docs/api-patterns.md`를 따른다.
- 새 컴포넌트를 직접 짜기 전에 `shared/ui`, 관련 도메인 `features/*/ui`, `docs/library-catalog.md` 순서로 재사용할 것을 찾는다. 타입이 묶여 못 쓰면 제네릭으로 바꿔 공유한다.
- 네이티브 모듈을 추가하면 OTA로 배포할 수 없다. PR 본문에 "스토어 빌드 필요"를 적는다.

## 스키마와 API

- 서버는 `slowteady/keeper-backend`. DTO·에러 코드·마이그레이션은 `../keeper-backend`에서 확인하고, 없으면 `gh api`로 그 레포 파일을 읽는다.
- 응답 형식: 성공 `{ code: 'OK', data }`, 실패 `{ code: 'FAIL', error: <코드>, message }`, 목록 `{ items, hasNext }`(1부터).
- zod 스키마는 `entities/<도메인>/schema.ts`. 요청은 enum으로 엄격하게, 응답은 느슨하게. nullable·optional은 백엔드 DTO와 DB 기준으로 정한다.
- query/mutation은 `entities/<도메인>/api.ts`의 options factory로만 노출한다.
- 날짜는 dayjs.
- 분석 이벤트를 추가·변경하면 `docs/analytics-events.md`를 같은 PR에서 고친다.

## 화면

- 디자인 시스템: Tamagui 토큰. 색 코드 직접 사용 금지.
- 문구: 해요체. 추상적인 미사여구 없이 구체적으로 쓴다.

## 브랜치

- 기본 브랜치: `develop`. 이슈 PR은 develop으로 보낸다.
- 출시는 GitHub Actions `Release` 워크플로가 `release/vX.Y.Z`를 만들어 main으로 PR을 연다. main 머지와 스토어 제출은 사람이 한다.
- 이름 규칙: `타입/짧은-영어-설명`, 타입은 소문자 `feat`·`fix`·`docs`·`refactor`·`test`·`style`·`chore` (예: `fix/missing-poster-share`)

## 작업 흐름

- PR 자동 리뷰(GitHub Actions `claude-review.yml`)는 쓰지 않는다. 보일러플레이트를 복사할 때 그 파일은 빼고, 리뷰는 PR 전에 로컬 `pr-review`로 한다 → keeper-app `docs/decisions/0001-이슈-기반-작업.md`

## 검증

- `npx tsc --noEmit`, `npx jest`, `npx eslint src/`. 단일 파일 jest는 `--forceExit`를 붙인다.
- 화면이 바뀌면 iOS 시뮬레이터에서 Maestro MCP로 직접 흐름을 돌려 확인하고 스크린샷을 PR 본문에 넣는다. 로그인은 로그인 화면의 `[DEV] 개발자 로그인`을 쓴다.
- 시뮬레이터가 로컬 백엔드에 붙지 않으면 `.env.development.local`에 `EXPO_PUBLIC_API_URL=http://127.0.0.1:3000`을 임시로 두고, 확인이 끝나면 지운다.
- 로컬 백엔드(:3000)는 사용자가 띄운 서버일 수 있다. 넓은 범위의 `pkill`로 끄지 않는다.

## 리뷰 기준 (pr-review에 더함)

- 🔴 FSD import 방향 위반, 같은 레이어 슬라이스 간 import, 슬라이스 `index.ts` 우회
- 🔴 위 "공개 레포" 규칙 위반
- 🔴 네이티브 모듈 추가인데 PR 본문에 스토어 빌드 필요 표시가 없음
- 🔴 분석 이벤트를 바꿨는데 `docs/analytics-events.md`가 그대로임
- 🟡 hook 반환값을 그룹 객체로 묶거나 `vm.foo`처럼 통째로 참조
- 🟡 불필요한 `useCallback`·`useMemo`, Expo Router 파일 밖의 default export
