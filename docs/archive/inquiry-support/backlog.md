# 백로그: 문의하기(고객지원/CS) 재설계

작성일: 2026-06-18
상태: 아이디어 확정·스펙 상세화 대기

---

## 배경 / 왜

- 프로필 → 문의하기에 폼(유형·내용·이미지) + 문의내역 탭 UI가 이미 있으나 **백엔드 미연동 스텁**이다. 폼 `handleSubmit`은 `// TODO: POST /api/inquiries`로 무동작, 문의내역은 `data=[]` 하드코딩이라 항상 빈 상태.
- 즉 사용자가 "등록하기"를 눌러도 아무 일도 안 일어나고, 운영자가 받을 곳도 없다. 출시 시 **유령 기능**이 노출되는 셈.
- 1인·소수 운영에서 사용자 문의는 신뢰의 마지막 창구. 입양 절차·개인입양 법규·계정/로그인 문제·신고 이의 등 실제 문의가 발생하는데 받을 채널이 없으면 이탈·앱스토어 악평으로 직결.
- 신고 처리(`moderation`)·공지(`notice`)가 이미 **운영자→사용자 단방향 통지** 패턴을 구현/기획 중이고, `00-notification-system.md`는 "이의(appeal) 경로를 출시 MVP에서 문의하기로 갈음"을 TBD로 남겨둠 → 문의하기가 이 공백을 메우는 자연스러운 채널.

## 전략 축

1. **받을 수 있는 채널을 실제로 만든다** — 폼 제출이 백엔드에 저장되고, 운영자가 admin에서 보고 답할 수 있게. (현재는 0)
2. **피드백 루프를 닫는다** — 문의내역이 있으므로 답변(피드백) UI + 알림으로 "접수됐고 답이 왔다"를 사용자가 인앱에서 확인. 단방향(운영자→사용자), 실시간 채팅 아님.
3. **채널 단일화로 1인 운영 부담 최소화** — 신고 이의제기·계정 문제를 별도 창구로 흩지 않고 문의하기로 모은다.

## 선행 조건

- **알림 시스템(`00-notification-system.md`)** — 운영자 답변 시 push + 인앱 알림함. inquiry는 이 인프라에 얹힌다. (P0 동시 진행)
- **admin 콘솔(`admin-console.md`)** — 운영자가 문의 조회·답변. keeper-web admin. (운영자도 앱 설치해 push 수신)
- 백엔드 inquiry 모듈 신설 (신규).

## 핵심 가설

- 문의량의 상당수는 반복 질문(입양 절차·법규·계정)이라 **FAQ 디플렉션이 1인 운영 부담을 크게 낮춘다** → 단, 이번 범위에서 **연기**(아래 로드맵 Phase 2). 우선 받는 채널부터.
- 인앱 답변 + 알림으로 피드백 루프를 닫으면 이메일 왕복보다 응답 체감·재방문이 높다(당근·Intercom 인앱 스레드 패턴).

## 데이터 모델 (초안)

> 결정 아님. 발산 단계 초안. 상세는 `/spec`에서 확정.

- **inquiry** — `id`, `userId`(FK), `type`(enum: 입양/계정·로그인/오류·버그/후원/제안/이의제기/기타), `content`(text), `images`(string[]), `status`(enum: RECEIVED/IN_PROGRESS/DONE, 기본 RECEIVED), `createdAt`, `updatedAt`
- **inquiry_reply** — `id`, `inquiryId`(FK), `body`(text), `authorType`(ADMIN), `createdAt` — 운영자 답변(1~N건). 단방향이므로 사용자 추가 답글은 MVP 제외(필요 시 후속).
- 이의제기 통합 시: inquiry에 `relatedReportId`(nullable FK) 또는 type=이의제기로 연결. (스펙에서 확정)
- 알림 연동: 답변 생성 시 알림 시스템이 push + 인앱 알림 발행.

## 로드맵 (Phase 단위)

### Phase 0: 선행

- 알림 시스템(push + 인앱 알림함) 최소 동작, admin 콘솔 골격.

### Phase 1: MVP (이번 출시 목표)

- 백엔드 inquiry 모듈(테이블·DTO·POST 제출·내역 조회) 신설.
- 프론트: 폼 `handleSubmit` 실연동, 문의내역에 **상태 뱃지(접수/처리중/완료) + 운영자 답변 표시 UI**.
- 유형 재정비: **실종·목격 제외**(실종분실 별도 기능), 입양/계정·로그인/오류·버그/후원/제안/이의제기/기타.
- admin: 문의 목록·상세·답변·상태 변경.
- 답변 시 push + 인앱 알림.
- 신고 이의제기 → 문의하기(type=이의제기)로 통합.

### Phase 2: 후속 (이번 범위 밖)

- **FAQ/도움말 셀프서비스** — 문의 진입 상단 아코디언으로 반복질문 디플렉션. (뒷순서로 연기 — 사용자 지시 2026-06-18)
- 사용자 추가 답글(양방향 스레드), 만족도 평가 등.

## 레퍼런스 BP

- [당근마켓 고객센터](https://cs.kr.karrotmarket.com/wv/faqs) — FAQ→봇→상담원 퍼널 + 인앱 1:1 스레드 → keeper는 봇/실시간 제외하되 **인앱 스레드(답변 표시)**만 차용.
- [번개장터 헬프](https://help.bunjang.co.kr/faq) — FAQ 탭 + 문의 폼 + 24h 답변 공지 → **응답시간 기대치 텍스트 안내** 차용.
- [포인핸드](https://apps.apple.com/kr/app/id1019549518) — 이메일 단일·FAQ 없음(동물 도메인 최소 구성) → keeper는 이메일 대신 **인앱**으로 한 단계 위. 최소 구성 참고선.
- [Petfinder 헬프센터](https://help.petfinder.com/s/) / [Nextdoor Contact](https://help.nextdoor.com/s/article/How-to-Contact-Us) — FAQ 선행 + 유형 드롭다운 폼 + 24h SLA → 유형 분류 + (후속)FAQ 디플렉션 근거.
- [Zendesk 티켓 상태](https://swifteq.com/post/zendesk-ai-agents-vs-intercom-fin) — 접수/처리중/완료 3단계 표준 → **상태 뱃지** 채택.

## 컷한 옵션 (사유 명시)

- **이메일 전달 채널** — 컷. 사용자 지시(2026-06-18): 문의내역·답변 UI가 인앱에 있으므로 이메일 불필요. 인앱 단일 채널이 피드백 루프가 닫혀 체감↑.
- **양방향 실시간 채팅(상담원)** — 컷. 1인 운영 24/7 불가. 단방향 답변(운영자→사용자)으로 충분.
- **AI 챗봇 디플렉션(Intercom Fin류)** — 컷. 초기 신생 규모·운영 부담 대비 과함.
- **FAQ 셀프서비스** — 이번 범위에서 **연기**(컷 아님). Phase 2. 받는 채널을 먼저 세우고, 문의 패턴이 쌓이면 FAQ로 흡수.

## 오픈 이슈 / 결정 필요

- **이의제기 통합 방식** — type=이의제기 단순 분류 vs `relatedReportId`로 신고 건과 연결. → `/spec`에서 확정 (기본 방향=통합 확정).
- **답변 가시성 정책** — `00-notification-system.md`의 통지 비대칭(게시자=사유+이의 / 신고자=결과만)과 정합 맞출 것. 이의제기 문의의 답변 노출 범위.
- **운영자 답변 N건 허용 여부** — MVP는 1건이면 충분한지, 추가 답변 가능하게 할지.

## 참고

- 현재 코드: `src/widgets/profile/ui/inquiry-form-scene.tsx`, `inquiry-history-scene.tsx`, `src/app/(untabs)/profile/inquiry/`, `src/features/profile/main/model/constants.ts`(메뉴 등록)
- 의존: [[00-notification-system]], [[admin-console]]
- IA 정합: [[ia-redesign]] — 실종·목격은 문의 유형이 아니라 별도 기능
