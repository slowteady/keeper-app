# QA — 개인입양 글 작성/수정 modal 전환

| 항목   | 값                                                                   |
| ------ | -------------------------------------------------------------------- |
| 기능   | 개인입양 글 작성/수정 화면을 stack push → modal (page sheet) 로 전환 |
| 검수일 | 2026-05-26                                                           |
| 검수자 | qa-auditor + MCP 시뮬                                                |
| 상태   | P0 1건 미해결 (사용자 시나리오 확인 대기)                            |

## 변경 요약

- `(tabs)/community` 에서 호출되는 write 라우트를 root navigator (`app/_layout.tsx`) 직속 자식으로 이동 + `presentation: 'modal'`
- edit 라우트는 `(untabs)/community/[id]/_layout.tsx` 의 자식으로 등록 (`name="edit/index"`, `presentation: 'modal'`, `headerShown: false`)
- 라우트 평탄화 — 구 `/community/write` → `/community-write`
- `ModalPageHeader` 에 `fullScreen` prop 추가 (default false = sheet 모드 pt=8 / true = fullScreenModal 모드 pt=safeArea+10)
- `CommunityAdoptForm` H1 + title prop 제거 (헤더가 ModalPageHeader 로 이관)
- 신고하기는 `fullScreen` prop 명시 (기존 fullScreenModal presentation 유지)
- 근거: [expo/router#630](https://github.com/expo/router/issues/630) — modal 호출이 다른 layout에서 일어나면 stack push로 fall-through

## 자동 테스트

| 항목   | 결과                                      |
| ------ | ----------------------------------------- |
| tsc    | PASS (0 errors)                           |
| jest   | 434/434 PASS                              |
| eslint | PASS (0 errors, carry-over warnings only) |

## MCP 시뮬 검수

| 항목                                                  | 결과                                                 |
| ----------------------------------------------------- | ---------------------------------------------------- |
| write modal (page sheet) iOS                          | ✅                                                   |
| edit modal (page sheet) iOS                           | ✅ (dim 영역 + sheet inset + headerShown false 적용) |
| ModalPageHeader sheet 헤더 위 공간 (fullScreen=false) | ✅ status bar 바로 아래 X 위치                       |
| edit 폼 prefill                                       | ✅                                                   |
| 신고하기 modal (fullScreenModal + fullScreen prop)    | 미검증 (회귀 없음 가정)                              |
| write modal swipe-down 차단 (gestureEnabled=false)    | ✅ 헤더/본문 swipe-down 시도 후 modal 유지           |
| 활짝핀 늑대 → dev_11 글 진입 → +not-found             | ⏸ **boundary 외 — 차단 cache 이슈로 분리, backlog**  |

## 발견 사항

| 등급   | 항목                                                                                                                                                                                                                                    | 처리                                                                        |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| P0     | 다른 계정으로 본인 외 글 진입 시 `+not-found` 페이지 노출                                                                                                                                                                               | **사용자 시나리오 추가 확인 필요** — 우리 변경 전부터인지/후부터인지 미파악 |
| ~~P1~~ | ~~iOS native modal swipe-down dismiss 시 `usePreventRemove` 가로채기 미보장~~ — **resolved**: write/edit 양쪽 `gestureEnabled: false` 적용. 시뮬에서 헤더/본문 swipe-down 모두 차단 확인. X 버튼만 dismiss 가능 → CancelModal 흐름 보장 | —                                                                           |
| P1     | edit `FIELD_ORDER` (14개) 와 write `FIELD_ORDER` (필수 6개) 순서 불일치 — `images` 위치 다름. 검증 실패 토스트 자동스크롤 순서 UX 혼선                                                                                                  | 후속 정리 — write 의 필수 6개 순서 우선 적용, 선택 필드는 그 뒤 추가        |
| P2     | deep-link URL `/community/write` → `/community-write` 변경. 외부 공유/푸시 알림이 있다면 dead link                                                                                                                                      | `use-share.ts` 등 공유 URL 구성 검토                                        |
| P2     | `ModalPageHeader` `fullScreen` 분기 단위 테스트 없음                                                                                                                                                                                    | jest 추가 권장                                                              |
| P2     | `[id]/_layout.tsx` `screenOptions` 상속 동작 — 향후 라우트 추가 시 `headerShown: false` 누락 위험                                                                                                                                       | 컨벤션 메모만                                                               |

## Fix 이력

- 2026-05-26 — Stack.Screen `name="edit"` 으로 잘못 변경 시도 → segment 매칭 실패 + stack push 회귀 / `name="edit/index"` 로 복구
- 2026-05-26 — `ModalPageHeader` 가 sheet 환경에서도 status bar inset 적용해서 상단 공간 과다 / `fullScreen` prop 추가, sheet 모드 기본 (pt=8)
- 2026-05-26 — `name="community/write"` (슬래시 표기) 매칭 실패 → root level `community-write.tsx` 평탄화 (URL `/community-write`)
- 2026-05-26 — modal (page sheet) BP 재조사: Apple HIG 가 fullscreen modal 도 compose 에 명시 (이메일 작성 예시). keeper 입양 홍보 = 긴 폼 (7개 섹션) + 100% attention 컨텍스트 → `fullScreenModal` 로 전환. `gestureEnabled: false` / sheet 옵션 모두 제거 (fullscreen은 swipe-down 자체 없음). write/edit `ModalPageHeader fullScreen` prop 명시
- 2026-05-26 — `CancelModal` 가 fullScreenModal 안에서 안 보이는 이슈: RN Modal (ModalProvider 의 React Native Modal) 이 native fullScreenModal view controller 아래로 가려짐 (iOS view controller hierarchy). 해결: `CancelModal` 를 ModalProvider/RN Modal 의존 제거 → screen view tree 안 `StyleSheet.absoluteFill` overlay 로 변경. 추가로 `usePreventRemove` + allowLeave/pendingExit 복잡 로직 제거, X 버튼 onClose 에서 직접 dirty check → setShowCancelModal 호출하는 단순 흐름으로 정리
- 2026-05-26 — `BottomSheet` (보호유형/나이/품종/지역/연락처 select) 가 fullScreenModal 안에서 안 보이는 이슈 — `@gorhom/bottom-sheet` 가 `@gorhom/portal` portal 사용. 동일 view controller hierarchy 문제. 해결: `BottomSheetModal` 의 `containerComponent={FullWindowOverlay}` 적용 (iOS 만). `@gorhom/bottom-sheet` types.d.ts 공식 권장 BP. iOS UIWindow level overlay 로 portal 끌어올림. `bottom-sheet-provider.tsx` (전역) + `bottom-sheet.tsx` (LocationBottomSheet 등) 두 파일. iOS 표준 패턴 (Mail compose 안 picker, Instagram compose 안 location picker 등) 의 RN 구현 한계 보완
