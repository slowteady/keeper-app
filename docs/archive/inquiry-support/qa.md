# QA: 문의하기(inquiry-support)

## 1. 메타

- QA 일자: 2026-06-19
- 대상 기능: inquiry-support (문의하기 재설계)
- 상태: **통과** — 코드 P0/P1 해결, privacy.md(v1.3) 정합 갱신 완료. 잔여: keeper-web push 배포만(시행 2026-06-26)
- 입력 PRD: docs/prd/inquiry-support.md
- 입력 Design: docs/design/inquiry-support.md
- 입력 Spec: docs/spec/inquiry-support.md

## 2. 명세 정합성

| 명세 항목                                            | 위치                                          | 상태                                         |
| ---------------------------------------------------- | --------------------------------------------- | -------------------------------------------- |
| FR-1 문의 제출(throttle)                             | inquiry.controller.ts                         | ✅                                           |
| FR-2 유형 7종(실종·목격 제거)                        | inquiry.dto.ts·entities/inquiry/schema.ts     | ✅ 3층 일치                                  |
| FR-3 내 목록+상태 뱃지                               | use-my-inquiries·inquiry-history-scene        | ✅                                           |
| FR-4 운영자 답변 N건                                 | inquiry.service.addReply·inquiry-detail-scene | ✅                                           |
| FR-5 답변 알림                                       | —                                             | ⚠️ no-op(알림 시스템 의존, hook 미정의 — P2) |
| FR-6 admin 답변·상태                                 | AdminInquiryController @Roles(ADMIN)          | ✅                                           |
| FR-7 이의제기 통합(type=APPEAL)                      | schema                                        | ✅ (FK 미연결=spec 의도)                     |
| 스키마 3중검증 type/content(2~500)/images(10)/status | dto·schema·prisma                             | ✅                                           |
| 소유자 검증 → 403                                    | inquiry.service.ts:80                         | ✅                                           |
| 상태 전이맵 + 불가 차단                              | inquiry.service STATUS_TRANSITIONS            | ✅                                           |
| RBAC(JwtAuthGuard 선행 보장)                         | app.module APP_GUARD + RolesGuard             | ✅                                           |
| throttler 5/시간 userId                              | user-throttler.guard                          | ✅                                           |
| PII 파기(탈퇴 즉시 Cascade + 미탈퇴 DONE+1년 cron)   | inquiry-cleanup.service·schema                | ✅ 코드·정책(privacy v1.3) 정합              |

## 3. 위험 기반 분석

| 변경 모듈              | 영향                  | 커버리지                                                         |
| ---------------------- | --------------------- | ---------------------------------------------------------------- |
| RBAC(roles.guard)      | 모든 admin 엔드포인트 | 단위 테스트 없음(P2) — JwtAuthGuard 선행으로 우회 위험 낮음 확인 |
| inquiry.service        | 문의 CRUD+답변        | spec.ts 8케이스(소유자·전이 커버)                                |
| inquiry-cleanup        | PII 삭제(법규)        | spec.ts 2케이스 추가(조건·에러 무중단)                           |
| use-image-upload(공유) | 전 앱 이미지 업로드   | 기존 test + res.ok 분기                                          |

회귀: 공유 파일(use-image-upload·image-selector) 수정 → 앱 전체 513 테스트 통과로 회귀 없음 확인.

## 4. 자동 테스트 결과

- **keeper-backend tsc**: PASS / **jest**: 178 PASS(29 suites, inquiry 10) / **eslint**(inquiry·guard·decorator): PASS
- **keeper-app tsc**: PASS / **jest**: 513 PASS(91 suites) / **eslint**(변경영역): PASS

## 5. MCP 시뮬 검수 (iOS, 로컬 백엔드 :3000 연동)

- 작성 폼: 7종 유형(실종·목격 제거)·유형+내용 시 등록 활성 ✅
- 제출 → 이미지 업로드 → 생성 → 상세 이동 ✅
- 상세: 접수 뱃지·유형 칩·시각·본문·"답변 준비중" 카드 스택 ✅
- 문의내역: 상태 뱃지 리스트 실데이터 ✅
- (fix는 실패경로·관측성만 변경 → 해피패스 동작 불변, 재검 불요)

## 6. 발견 사항 (P0/P1/P2) + 처리 이력

### P0

| #   | 항목                                                             | 위치                  | 처리                                                                                                                                                                                           |
| --- | ---------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | 이미지 업로드 silent failure(res.ok 미검사 → 깨진 URL 정상 저장) | use-image-upload.ts   | ✅ **fix**(res.ok→throw) 2026-06-19                                                                                                                                                            |
| Q2  | privacy.md "1:1 문의 즉시 파기" ↔ cron "DONE+3년" 정면 충돌      | keeper-web privacy.md | ✅ **해결** — BP 재조사 결과 전자상거래법 비대상 확인 → 탈퇴 즉시 파기(Cascade) + 미탈퇴 1년으로 코드 정정, privacy.md v1.3 전면 갱신(국외이전·전자상거래법 삭제 포함). keeper-web push만 남음 |

### P1 (전부 fix)

| #   | 항목                                                      | 처리                                                |
| --- | --------------------------------------------------------- | --------------------------------------------------- |
| Q3  | RolesGuard 기본 ForbiddenException → 응답 envelope 불일치 | ✅ BaseException(FORBIDDEN)                         |
| Q4  | inquiry `:id` uuid 미검증 → 500                           | ✅ ParseUUIDPipe                                    |
| Q5  | cleanup cron try/catch 부재 + 0건 무로그(PII 관측성)      | ✅ try/catch + 항상 로그 + 단위 테스트              |
| Q6  | useCreateInquiry onError 무로깅                           | ✅ logger.error                                     |
| Q7  | image-selector 선택 실패 사용자 무피드백                  | ✅ globalToast                                      |
| Q8  | enum 3중 수기 중복 drift(BE)                              | ✅ `as const satisfies readonly InquiryType[]` 가드 |

### P2 (백로그/후속)

- images `z.string()` R2 키 형식 미검증(SSRF성 입력 여지) · FE↔BE 응답 계약 수기 중복(OpenAPI codegen 후속) · throttler trust proxy/anonymous 버킷(다인스턴스 전환 시 Redis) · addReply DONE 직행(spec "IN_PROGRESS/DONE" 문구 정합) · spec detail queryKey 표 불일치(문서) · features/widgets inquiry 테스트 보강 · FR-5 알림 hook 포인트 · doneAt 전용 컬럼.

## 7. 결론

코드 P0(Q1)·P1 6건 fix, Q2(정책 정합)는 BP 재조사 후 코드(Cascade+1년) 정정 + privacy.md v1.3 전면 갱신으로 해결. 양 레포 tsc/jest/eslint·MCP 통과. **잔여 = keeper-web push 배포(시행 2026-06-26)** 뿐.
