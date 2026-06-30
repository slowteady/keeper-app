# QA: community-write-form-bp

## 1. 메타

- 최초 QA: 2026-05-25 — 통과 (P1 2건 동일 사이클 fix)
- 재검수: 2026-05-25 — 통과 (P1 3건 동일 사이클 fix, E2E 시나리오 4종 PASS)
- 대상 기능: 개인입양 공고 작성/수정/삭제/상세/list (BP 재구성 + 누적 변경)
- 입력 PRD/Design/Spec: 없음 — 컨버세이션 결정사항이 명세 역할
  - 결정 누적: 필수 6개 축소 / 4섹션 그룹핑 / 이미지 최상단 / chip default 미선택 / ChipGroup clearable / "한 줄 요약" / 좋아해요-싫어해요-아파요 분리 / 펼쳐보기 / 연락처 hint / 제목 50자 / paddingBottom / 몸무게 자유 입력 / 전화번호 auto-format / placeholder 일관성 / 이미지 mock / BS swipe + 내부 스크롤 / KeyboardSticky onLayout 가드 / pull-to-refresh / list+detail nullish

## 2. 명세 정합성

| 명세 항목                                                              | 위치 (file:line)                                                                                            | 상태                                                  |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 필수 6개 (animalType/protectionType/title/content/images/contact)      | `entities/community/schema.ts:17-32`                                                                        | ✅                                                    |
| 4섹션 그룹핑 ①사진 ②공고정보 ③아이정보 ④연락처                         | `widgets/community-adopt-feed-section/ui/community-adopt-form.tsx:49-216`                                   | ✅                                                    |
| 칩 default 미선택 (선택 필드)                                          | `features/community/create/model/use-create-post.tsx:26-29`                                                 | ✅                                                    |
| ChipGroup clearable — 필수=false, 선택=true                            | `shared/ui/data-display/chip-group.tsx:23`, `features/community/create/ui/field/option-select-field.tsx:31` | ✅                                                    |
| "특징" → "한 줄 요약" + 선택 + 종합 톤 placeholder                     | `widgets/community-adopt-feed-section/ui/community-adopt-form.tsx:91-95`                                    | ✅                                                    |
| 좋아해요/싫어해요/아파요 분리 유지                                     | `widgets/community-adopt-feed-section/ui/community-adopt-form.tsx:173-199`                                  | ✅                                                    |
| 펼쳐보기 라벨 "추가 정보 적기 (선택)" + 위치 아이 정보 섹션 안쪽       | `widgets/community-adopt-feed-section/ui/community-adopt-form.tsx:155-205`                                  | ✅                                                    |
| 연락처 "여러 개 선택할 수 있어요" hint                                 | `widgets/community-adopt-feed-section/ui/community-adopt-form.tsx:214`                                      | ✅                                                    |
| 제목 50자 — UI maxLength + zod max                                     | `entities/community/schema.ts:20` (fix 후)                                                                  | ✅                                                    |
| KeyboardAwareScrollView paddingBottom = buttonHeight + 40              | `app/(untabs)/community/write/index.tsx:118`                                                                | ✅                                                    |
| 필수 chip default 사전 선택 (animalType=DOG, protectionType=TEMPORARY) | `use-create-post.tsx:19-20`                                                                                 | ⚠️ 의도된 동작 — 필수 chip은 사용자 의도 강제 유도 BP |

## 3. 위험 기반 분석

### 최근 변경 모듈

| 변경 모듈                                                             | 영향 범위                      | 커버리지 갭                                                     |
| --------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------- |
| `entities/community/schema.ts`                                        | detail/edit/create 파싱 전체   | `CommunityAdoptDetailSchema` nullish 필드 파싱 실패 테스트 없음 |
| `entities/community/constant.ts` (NONE chip 제거)                     | community-adopt-card 태그 표시 | 구버전 'NONE' 값 보유 row 호환 — from-detail 에서 정규화로 해결 |
| `features/community/create/model/api.ts` (orUndefined)                | 등록/수정 흐름                 | 'NONE' 안전망 추가 후 covered                                   |
| `widgets/community-adopt-form.tsx` (전면 재구조)                      | write + edit 공용 위젯         | LabelSelectField 컴포넌트 단위 테스트 없음                      |
| `app/(untabs)/community/write/index.tsx` (FIELD_ORDER, paddingBottom) | 등록 흐름 / 검증 토스트        | 'images' 첫 에러일 때 setFocus 동작 안 함 (P2)                  |
| `shared/ui/data-display/chip-group.tsx` (clearable prop)              | 앱 전체 ChipGroup 사용처       | clearable 단위 테스트 없음                                      |

### 회귀 위험 영역

- 기존 DB row 편집 시 'NONE' enum 처리 — from-detail + api.ts orUndefined 양쪽에서 방어 적용 ✅
- community detail 페이지 null 필드 렌더 — mapper.ts 에서 `?? '-'` fallback 처리 ✅
- 백엔드 nullable 마이그레이션 적용 — local DB 적용 완료, 운영은 백엔드 담당자 검수 후 적용

## 4. 자동 테스트 결과

- **tsc** (keeper-app): PASS (0 errors)
- **tsc** (keeper-api): PASS (0 errors)
- **jest** (keeper-app): 435/435 PASS — 실패 없음. worker force-exit 경고 1건은 기존 teardown 누수 (이번 변경 무관)
- **eslint** (keeper-app): PASS (0 errors, 16 warnings — 모두 carry-over)

## 5. MCP 시뮬 검수 (iOS)

| 항목                                                                | 결과 |
| ------------------------------------------------------------------- | ---- |
| 폼 구조 4섹션 시각                                                  | ✅   |
| 이미지 최상단 + 필수\* 표시                                         | ✅   |
| "한 줄 요약" 라벨 + 종합 톤 placeholder                             | ✅   |
| 선택 chip default 미선택 (성별/중성화/건강검진/예방접종)            | ✅   |
| "정보없음" chip 제거                                                | ✅   |
| ChipGroup clearable — 선택 chip 재탭 시 deselect                    | ✅   |
| ChipGroup non-clearable — 필수 chip(강아지) active 유지             | ✅   |
| 추가 정보 적기 (선택) accordion 펼침/접힘                           | ✅   |
| 연락처 "여러 개 선택할 수 있어요" hint 노출                         | ✅   |
| inline 검증 에러 (이미지/제목/소개글/연락처)                        | ✅   |
| KeyboardAwareScrollView paddingBottom — 하단 컨텐츠 잘림 해소       | ✅   |
| 자동 스크롤 — 첫 에러 필드로 이동 (textarea 한정)                   | ✅   |
| 토스트 — globalToast 호출은 코드로 확인, 시뮬 시각 노출 미잡음 (P2) | ⚠️   |

## 6. 발견 사항

### P0 (즉시 fix)

없음.

### P1 (이번 사이클 fix 완료)

- **'NONE' 값 정규화 부재**: `from-detail.ts`가 'NONE' enum을 그대로 폼에 전달 → 편집 시 백엔드로 'NONE' 재전송 위험. **fix**: `from-detail.ts:3-6` `orUndefined` 헬퍼 추가 ('NONE' / null / undefined 모두 undefined로). 방어 강화로 `api.ts:33-35` orUndefined도 'NONE' 포함.
- **title zod `max(50)` 누락**: UI maxLength만으로 제한, 직접 API 호출 시 50자 초과 가능. **fix**: `entities/community/schema.ts:20` `.max(50, '제목은 50자 이내로 입력해주세요')` 추가.

### P2 (관찰 / 다음 사이클)

- **토스트 시뮬 시각 미잡음**: `globalToast` 호출은 코드로 확인되나 maestro screenshot 타이밍 또는 sonner-native + 키보드 조합 이슈로 시각 노출 못 잡음. 실 디바이스 검증 필요 가능성.
- **'images' 첫 에러일 때 자동 스크롤 부재**: `form.setFocus('images')` 동작 안 함 (RHF register 안 됨). 이미지 영역을 위한 별도 ref + scrollTo 처리 검토.
- **LabelSelectField / ChipGroup `clearable` 단위 테스트 없음**: 신규 동작이지만 단위 테스트 미작성.
- **`CommunityAdoptDetailSchema` nullish 필드 파싱 테스트 부족**: null 혼재 응답 케이스 명시 커버리지.
- **eslint 16 warnings carry-over**: 이번 기능 무관 누적 기술부채.

## 7. 권장 조치

- **즉시** — P0 없음. P1 두 건은 이번 사이클에서 fix 완료.
- **다음 사이클** — 실 디바이스로 토스트 노출 확인 / 이미지 영역 자동 스크롤 ref 추가 / chip-group + label-select-field 단위 테스트 추가.
- **관찰** — eslint warnings carry-over는 별도 정리 사이클로.

---

## 8. 재검수 (2026-05-25)

### 추가 누적 변경 검증

위 결정 1차 검수 이후 추가된 변경:

- 몸무게 자유 입력 (TextField + decimal-pad + maxLength 5 + zod regex `^(\d{1,3}(\.\d{1,2})?)?$`)
- 전화번호 auto-format `formatPhone` 3-4-4 (11자리 cap)
- placeholder 일관성 (예) … 패턴) + 이메일 `email-address` keyboardType + maxLength
- 이미지 mock (`IS_MOCK_UPLOAD = __DEV__ && typeof jest === 'undefined'`, picsum 10개 cycle)
- BottomSheetMenu `Pressable → TouchableOpacity` (스와이프 down)
- `BottomSheetScrollView` wrap + maxHeight + `disableViewWrap` Provider 옵션 (내부 스크롤)
- KeyboardSticky `onLayout` setState 가드 (animation skip 방지)
- 댓글 detail pull-to-refresh (detail + comment list invalidate)
- 댓글 nodata paddingBottom 조건부 (commentList.length > 0 ? inputHeight : 0)
- list/detail schema nullish (gender/neuterYn 등)

### MCP E2E 시나리오 결과

| 시나리오                                                                                                          | 결과 | 비고                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------- |
| 1차 — 작성 (이미지 1장 + 제목/소개글/전화번호 + 등록)                                                             | ✅   | 상세 진입 + 입력값 정상                                                                                   |
| 1차 — 수정 (제목에 EDITED append)                                                                                 | ✅   | edit 페이지 prefilled → PATCH 반영                                                                        |
| 1차 — 삭제 (BS 메뉴 → 확인 모달)                                                                                  | ✅   | list 복귀 + Render Error 없음 (schema nullish fix 후)                                                     |
| 2차 — 작성 (이미지 2장 + chip 4개 toggle(여아/중성화O/건강검진O/미접종) + 보호유형 입양 + 본문 + 전화번호 + 등록) | ✅   | 모든 입력 chip/이미지 detail 페이지 반영                                                                  |
| 2차 — 삭제                                                                                                        | ✅   | list 복귀                                                                                                 |
| 엣지 1 — 빈 폼 등록 시도                                                                                          | ✅   | inline 에러 "최소 1장의 이미지를 업로드해주세요" + "제목을 입력해주세요" 노출, 첫 에러 필드로 자동 스크롤 |
| 엣지 2 — 제목 50자 maxLength                                                                                      | ✅   | UI `maxLength={50}` + zod `.max(50)` 둘 다 적용 — 코드 검증                                               |
| 엣지 3 — 작성 중 ← 뒤로                                                                                           | ✅   | CancelModal "작성을 그만두시겠어요?" 노출 (usePreventRemove)                                              |
| 엣지 4 — CancelModal 닫기                                                                                         | ✅   | modal dismiss + 폼 dirty 상태 그대로 유지 (보호유형 입양 그대로)                                          |
| 엣지 5 — CancelModal 나가기                                                                                       | ✅   | list 복귀 + 작성 중 폼 폐기                                                                               |

### 자동 테스트 결과

- tsc (keeper-app): PASS (0 errors)
- tsc (keeper-api): PASS (0 errors)
- jest: 434/434 PASS
- eslint: 0 errors, 15 warnings (15/16 carry-over 잔존, 이번 PR 직접 1건 — 재검수 사이클 fix)

### 재검수 발견 사항

**P1 (이번 재검수 사이클 fix 완료)**

| 항목                                                                                | 위치                                             | fix                                                                                          |
| ----------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| edit FIELD_ORDER write/index 와 불일치 (선택 필드 우선 → 토스트가 선택 필드 가리킴) | `(untabs)/community/[id]/edit/index.tsx:18-34`   | write/index.tsx 와 동일 순서 (`images→protectionType→title→content→animalType→contact`) 적용 |
| `VaccinationCheckSchema` 등 enum 의 `NONE` 의도 모호                                | `shared/model/schema.ts:1-18`                    | 주석으로 의도 명확화 — 구버전 데이터 호환용, from-detail+api 가 NONE → undefined 정규화      |
| `community-adopt-card.tsx:75` useMemo 불필요 의존성 (`isLoggedIn`)                  | `entities/community/ui/community-adopt-card.tsx` | 의존성 제거 + 미사용 `isLoggedIn` prop 자체 제거                                             |

**P2 (관찰)**

| 항목                                              | 사유                                                                                      |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `specialMark` maxLength FE(100) vs BE(500) 불일치 | UX 정책상 한 줄 요약 100자 의도 — BE는 여유. 차이 의도된 것                               |
| `title` maxLength FE(50) vs BE(200) 불일치        | UX 정책상 50자 — FE가 더 엄격. 의도된 것                                                  |
| `BottomSheetScrollView` jest mock 미등록          | 현재 use-bottom-sheet-menu 단위 테스트 없어 영향 없음. 향후 테스트 신설 시 mock 추가 필요 |
| eslint 15 warnings carry-over                     | 이번 PR 외 기존 누적 — 별도 정리 사이클                                                   |
| 토스트 시뮬 미잡음 (1차에서 발견 동일)            | 실 디바이스 검증 권장                                                                     |

### 결론

P0 없음. P1 3건 모두 동일 사이클 fix 완료. E2E 시나리오 (작성/수정/삭제) 두 번 모두 PASS. **재검수 통과**.

## 참고

- 컨버세이션 결정사항 (PRD/Design/Spec 미작성)
- 관련 변경 파일:
  - keeper-api: `docs/migrations/023-post-adoption-personal-optional-fields.sql`, `src/api/community/entity/post_adoption_personal.entity.ts`, `src/api/community/type/post.ts`
  - keeper-app: `src/entities/community/schema.ts`, `src/entities/community/constant.ts`, `src/entities/community/lib/build-adopt-tags.ts`, `src/widgets/community-adopt-feed-section/ui/community-adopt-form.tsx`, `src/features/community/create/model/use-create-post.tsx`, `src/features/community/create/model/api.ts`, `src/features/community/create/ui/field/option-select-field.tsx`, `src/features/community/edit/lib/from-detail.ts`, `src/features/community/detail/model/mapper.ts`, `src/shared/ui/data-display/chip-group.tsx`, `src/app/(untabs)/community/write/index.tsx`
