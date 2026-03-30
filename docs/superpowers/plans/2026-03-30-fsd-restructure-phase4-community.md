# Phase 4: 커뮤니티(Community) FSD 재구조화

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 커뮤니티/댓글 도메인의 FSD 원칙 위반 수정. form field 컴포넌트를 features로 이동. features/common 제거. CommentSortOrderSchema 위치 수정. 파일명 kebab-case 전환.

**Architecture:** entities/community에는 schema+constant+순수UI+lib만 남긴다. form field 컴포넌트(ContactSelectField 등)는 features/community/create/ui로 이동. features/common/useLikePost는 features/like-post로 독립 슬라이스화. CommentSortOrderSchema는 entities/comment로 이동.

**Tech Stack:** React Native, React Hook Form, Zod, Tamagui

**의존:** Phase 3 완료 후 진행

---

## File Structure

### 변경 후

```
entities/community/
  schema.ts                    ← CommentSortOrderSchema 제거 (entities/comment로)
  constant.ts
  lib/
    convert-number.ts
  ui/
    community-adopt-card.tsx            ← 순수 UI (FSD 위반 수정 완료 — Phase 1에서 isLoggedIn prop)
    community-adopt-card-header.tsx
    community-adopt-card-stats.tsx
    community-write-header.tsx          ← router.push 제거, onPress prop으로
    index.ts
  index.ts

entities/comment/
  schema.ts                    ← CommentSortOrderSchema 추가
  ui/
    comment-card.tsx
    comment-form-input.tsx
    comment-like-button.tsx
    comment-list-header.tsx
    index.ts
  index.ts

features/community/
  create/
    model/
      use-create-post.ts       ← kebab-case
      use-create-post.test.ts
      api.ts
    lib/
      make-form-options.ts
    ui/
      create-post-kind-bottom-sheet.tsx
      field/                   ← entities에서 이동
        contact-select-field.tsx
        field-label.tsx
        label-image-selector.tsx
        label-text-area.tsx
        label-text-field.tsx
        option-select-field.tsx
        index.ts
      index.ts
    index.ts
  feed/                        ← list → feed 리네임
    model/
      use-community-adopt-feed.ts
      use-community-adopt-feed.test.ts
      use-post-filter.ts
      use-post-filter.test.ts
    index.ts
  detail/
    model/
      use-community-detail-feed.ts
      use-community-detail-feed.test.ts
      use-community-comment-list.ts
      use-community-comment-list.test.ts
      mapper.ts
    index.ts
  index.ts

features/like-post/            ← features/common에서 독립
  model/
    use-like-post.ts
    use-like-post.test.ts
  index.ts

features/comment/
  model/
    use-add-comment.ts
  index.ts
```

---

### Task 1: CommentSortOrderSchema를 entities/comment로 이동

**Files:**

- Modify: `src/entities/community/model/schema.ts` — CommentSortOrderSchema 제거
- Modify: `src/entities/comment/model/schema.ts` — CommentSortOrderSchema 추가
- Modify: import 사용처

- [ ] **Step 1: 스키마 이동**
- [ ] **Step 2: import 경로 변경** (`@/entities/community` → `@/entities/comment`)
- [ ] **Step 3: tsc + 테스트**
- [ ] **Step 4: 커밋**

```bash
git commit -m "REFACTOR: CommentSortOrderSchema를 entities/comment로 이동"
```

---

### Task 2: entities/community 정리 — form field 이동 + kebab-case

**Files:**

- Move: `entities/community/ui/field/*` → `features/community/create/ui/field/`
- Rename: 모든 UI 파일 → kebab-case
- 세그먼트 평탄화 (model/ → 슬라이스 루트)

- [ ] **Step 1: form field 컴포넌트 이동**

```bash
mkdir -p src/features/community/create/ui/field
mv src/entities/community/ui/field/* src/features/community/create/ui/field/
```

각 파일 kebab-case 변환:

- `ContactSelectField.tsx` → `contact-select-field.tsx`
- `FieldLabel.tsx` → `field-label.tsx`
- `LabelImageSelector.tsx` → `label-image-selector.tsx`
- `LabelTextArea.tsx` → `label-text-area.tsx`
- `LabelTextField.tsx` → `label-text-field.tsx`
- `OptionSelectField.tsx` → `option-select-field.tsx`

- [ ] **Step 2: entities/community UI kebab-case**

```bash
mv src/entities/community/ui/CommunityAdoptCard.tsx src/entities/community/ui/community-adopt-card.tsx
mv src/entities/community/ui/CommunityAdoptCardHeader.tsx src/entities/community/ui/community-adopt-card-header.tsx
mv src/entities/community/ui/CommunityAdoptCardStats.tsx src/entities/community/ui/community-adopt-card-stats.tsx
mv src/entities/community/ui/CommunityWriteHeader.tsx src/entities/community/ui/community-write-header.tsx
```

- [ ] **Step 3: CommunityWriteHeader에서 미사용 import 제거**

현재 `useLoginRequired`를 import하지만 실제 호출 안 함 → import 제거.

- [ ] **Step 4: 세그먼트 평탄화 + index.ts 재작성**
- [ ] **Step 5: tsc + 테스트**
- [ ] **Step 6: 커밋**

```bash
git commit -m "REFACTOR: entities/community form field → features 이동, kebab-case"
```

---

### Task 3: features/like-post 독립 슬라이스 + features/common 제거

**Files:**

- Move: `features/common/model/useLikePost.tsx` → `features/like-post/model/use-like-post.ts`
- Move: `features/common/model/useLikePost.test.tsx` → `features/like-post/model/use-like-post.test.ts`
- Delete: `features/common/` (전체)
- Create: `features/like-post/index.ts`

- [ ] **Step 1: features/like-post 생성 + 파일 이동**
- [ ] **Step 2: import 경로 변경** (`@/features/common` → `@/features/like-post`)
- [ ] **Step 3: features/common 삭제**
- [ ] **Step 4: tsc + 테스트**
- [ ] **Step 5: 커밋**

```bash
git commit -m "REFACTOR: features/like-post 독립 슬라이스 — features/common 제거"
```

---

### Task 4: features/community kebab-case + mock 정리

**Files:**

- Rename: features/community 내 모든 파일 → kebab-case
- features/community/list → features/community/feed 리네임

- [ ] **Step 1: 디렉토리 및 파일명 kebab-case 변환**
- [ ] **Step 2: barrel index 정리**
- [ ] **Step 3: tsc + 테스트**
- [ ] **Step 4: 커밋**

```bash
git commit -m "REFACTOR: features/community kebab-case + 구조 정리"
```

---

### Task 5: widgets/community kebab-case + 사용처 업데이트

**Files:**

- Rename: widgets/community-\*-section 내 모든 파일 → kebab-case
- Modify: app 화면 import 경로 업데이트

- [ ] **Step 1: widget 파일명 kebab-case**
- [ ] **Step 2: app 화면 import 경로 업데이트**
- [ ] **Step 3: FSD 위반 최종 확인**

```bash
grep -r "from '@/features" src/entities/community/ --include="*.ts" --include="*.tsx"
# Expected: 0건
```

- [ ] **Step 4: 전체 tsc + 테스트**
- [ ] **Step 5: 커밋**

```bash
git commit -m "REFACTOR: widgets/community kebab-case + 사용처 import 정리"
```

---

## Phase 4 완료 기준

- [ ] entities/community에 form field 컴포넌트 0개 (features로 이동)
- [ ] CommentSortOrderSchema가 entities/comment에 위치
- [ ] features/common 삭제, features/like-post 독립
- [ ] entities/community에서 features import 0건
- [ ] 파일명 kebab-case
- [ ] tsc 에러 0건
- [ ] 전체 테스트 통과

## 롤백 전략

각 Task는 독립 커밋. `git revert <commit>` 으로 개별 롤백 가능.
