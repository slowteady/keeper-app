---
status: 유효
date: 2026-10-28
---

# 이슈 기반 작업

## 맥락

keeper는 기능마다 `/prd → /design → /spec → /be → /fe → /qa` 스킬로 문서를 쌓으며 작업했다. 스킬이 항상 쓰이지는 않았고, 진행 상태가 대화에만 남아 "그거 처리됐어?"를 대화 기록에서 다시 찾는 일이 생겼다. 명세 먼저(SDD)·테스트 먼저(TDD)라는 생각은 공통 보일러플레이트 `slowteady/ai-issue-workflow`와 같다.

## 결정

- keeper-app, keeper-backend, keeper-web, keeper-admin 네 레포에 `ai-issue-workflow`의 규칙·훅·스킬(`issue-create`·`issue-work`·`pr-review`)을 붙인다. 레포마다 다른 것은 `.claude/rules/project.md`에만 쓴다.
- 기존 스킬(`prd`·`design`·`spec`·`be`·`fe`·`qa`·`review`·`feature`·`fix`)과 에이전트(`feature-researcher`·`qa-auditor`)는 지운다. 써드파티 컴포넌트 목록은 `docs/library-catalog.md`로 옮긴다. 시뮬레이터 화면 검수는 `project.md`의 검증 절로 옮긴다.
- 예전 문서(`docs/spec/` 등)는 옮기지 않고 `docs/README.md`의 "이전 기록"으로 둔다. 모듈 문서는 그 기능을 고치는 PR에서 만든다.
- 여러 레포에 걸친 기능은 레포별 이슈로 나눈다.
- 이 레포는 공개라 보안 결함·운영 데이터는 비공개 keeper-backend 이슈에 둔다.
- PR 자동 리뷰 워크플로(`claude-review.yml`)는 쓰지 않는다. 보일러플레이트를 다시 복사할 때도 이 파일은 뺀다. 리뷰는 에이전트가 PR을 올리기 전에 로컬 `pr-review`로 한다.
- Orca는 Claude를 Auto 권한 모드(`--permission-mode auto`)로 실행한다.

## 근거

- 사용자 지시(2026-10-28): "이제 이슈기반으로 모든 프로젝트를 진행하고 싶어서", "보일러 플레이트로 바꾸면 된다고 했으니까 바꿔봐"
- 공개 유지(2026-10-28): "keeper-app은 당분간은 오픈해놓는게 나아"
- 자동 리뷰 미사용(2026-10-28): "pr 리뷰 기능은 여기엔 안할거야"
