# 공지사항 (notice) — 백로그

> 발산·수렴 산출. 구현 아님. BP 딥조사(현황 + 외부 UX BP)로 결정 확정.

## 배경 / 문제

운영자가 사용자에게 소식·정책·긴급 안내를 전달할 채널이 없다. 백엔드 `Notice` 모델과 `GET /notices`·`/notices/:id`(@Public)는 있으나, 프론트 연동·일반/긴급 구분·이미지·노출 경로가 전부 비어 있다.

## 현황 (조사 완료)

**이미 있음**

- backend `Notice` 모델(`id·title·content·createdAt·updatedAt`만) + `GET /notices`·`/notices/:id`(@Public, list=content 제외 / detail=content 포함)
- 프로필 '공지사항' 메뉴·라우트(`/(untabs)/profile/notice`)·빈 위젯(`ProfileNoticeScene` data=[])
- 홈 `HomeBannerSection`(정적 이미지 캐러셀)
- `useAppGate`/`AppGateScreen`(앱 진입 시 점검·강제업데이트 전면 게이트) — 긴급공지 얹을 큐
- `/bootstrap`(maintenance/updateType/storeUrl/latestVersion)

**빈자리**

- backend: `Notice`에 `type`(일반/긴급)·`images` 필드 **없음** → 마이그레이션 필요. admin CRUD 없음(읽기 @Public만)
- frontend: `entities/notice`(API 클라이언트) 없음, 목록 데이터 미연동, 상세 라우트(`/notice/[id]`) 없음, 홈 공지 진입점 없음, 긴급공지 앱진입 노티 분기 없음
- 알림 인프라 폐기(push/인앱) → 긴급공지는 **인앱 모달로 독립 구현**(알림 시스템 의존 회피)

## 전략축 / 결정 (BP 근거)

| #   | 요구              | 결정                                                                                                             | BP 근거                                                     |
| --- | ----------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1   | 일반/긴급 2종     | `Notice.type` enum(NORMAL/URGENT) 마이그레이션                                                                   | —                                                           |
| 2   | 이미지 N장        | `Notice.images`(String[]) 마이그레이션 + R2 presign 재활용. 상세=스크롤 스트립 + 전체화면 뷰어                   | NN-g 다중이미지                                             |
| 3   | 긴급=앱진입 노티  | **인앱 하프시트**(전면 X). `useAppGate` 단일 큐: 점검/강제업뎃 우선 → 긴급공지 후순위(동시 노출 금지). push 아님 | NN-g(사용차단 아니면 비차단), 토스, Appcues(스택 모달 금지) |
| 3'  | 긴급 재노출       | 공지별 "다시 안 보기"(영구, `noticeId+dismissedAt` AsyncStorage) + 새 공지면 재노출                              | Smashing/NN-g(습관화 방지)                                  |
| 4   | 일반=홈 노출→상세 | 홈 **공지 전용 카드**(제목+날짜+뱃지), 기존 이미지 배너와 별도. 클릭→`/profile/notice/[id]`                      | 배민(카드형 우위, 띠배너 비추천)                            |
| 5   | 프로필 리스트     | `GET /notices` 연동, 읽음=dimmed(**로컬 ID 배열**, 서버 동기 X), type 뱃지                                       | NN-g, 1인 운영 규모                                         |

## 선행조건 / 의존

- **backend 마이그레이션**: `Notice` + `type`(enum)·`images`(String[])·노출제어(활성/만료 등 spec에서 확정). 마지막 마이그레이션 번호 +1
- **backend admin CRUD**: `POST/PATCH/DELETE /admin/notices`(@Roles ADMIN) — 공지 생성/수정/삭제
- **keeper-admin**(별도 레포): 공지 작성 화면(이미지 업로드 포함)
- **긴급공지 조회 경로**: `/bootstrap`에 활성 긴급공지 포함 vs 별도 `GET /notices?type=URGENT&active` — spec에서 확정
- 알림 시스템 무관(인앱 모달 독립)

## 컷한 옵션 (+ 사유)

- **전면 모달(긴급)**: 점검/강제업뎃 게이트와 위계 충돌 + 절제. 하프시트로.
- **push 알림**: 알림 인프라 폐기 + "앱 진입 즉시"는 인앱이 정답. push 의존 회피.
- **핀 고정**: 1인 운영·초기 공지량 적음 + 긴급은 이미 모달 처리 → YAGNI.
- **"오늘 하루 안 보기"**: 반복 프로모션용. 긴급공지는 1회 확인이 BP.
- **읽음 서버 동기화**: 1인 운영 과함. 로컬 관리.
- **홈 배너 통합**: 이미지 캐러셀(홍보)과 텍스트 공지 성격 달라 집중도 저하 → 별도 카드.

## 레퍼런스 BP

- [토스 모달 가이드](https://medium.com/@beomsu/%ED%86%A0%EC%8A%A4%EB%8A%94-%EB%AA%A8%EB%8B%AC%EC%9D%84-%EC%96%B8%EC%A0%9C-%EC%96%B4%EB%96%BB%EA%B2%8C-%EB%9D%84%EC%9A%B8%EA%B9%8C-841e97dda1eb) — 긴급도별 모달/시트. _keeper: 긴급공지=하프시트 근거_
- [NN-g Bottom Sheets](https://www.nngroup.com/articles/bottom-sheet/) — 사용 차단 아니면 비차단 시트
- [Appcues in-app notifications](https://www.appcues.com/blog/in-app-notifications) — 스택 모달 금지, 단일 큐 직렬. _appGate 큐 근거_
- [Smashing Notifications UX](https://www.smashingmagazine.com/2025/07/design-guidelines-better-notifications-ux/) — 반복 강제 노출 습관화. _재노출 절제 근거_
- [배민 UXUI](https://velog.io/@ivermatin/%EB%B0%B0%EB%8B%AC%EC%9D%98-%EB%AF%BC%EC%A1%B1-UXUI-%EB%B6%84%EC%84%9D) — 홈 카드형 공지. _홈 카드 근거_

## Open Issues (→ spec)

- 긴급공지 조회 경로(bootstrap 통합 vs 별도 endpoint) + 활성/만료 필드 설계
- `type` enum 값·`images` 타입(String[] vs Json) 3중 검증(zod↔DTO↔DB)
- 긴급공지 다수 동시 활성 시 노출 순서(최신 1건? 큐?)
- 읽음 로컬 저장 키 구조(AsyncStorage)
