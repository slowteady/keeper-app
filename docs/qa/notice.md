# QA: 공지사항 (notice)

> 입력: docs/prd/notice.md · docs/design/notice.md · docs/spec/notice.md. 검증일 2026-06-22.
> 범위: keeper-backend(로컬 미push) + keeper-app(feature/community 미커밋). keeper-admin 작성 화면·push는 범위 밖.

## 자동 테스트

| 항목                | 결과                                                |
| ------------------- | --------------------------------------------------- |
| keeper-app tsc      | PASS (0)                                            |
| keeper-app jest     | PASS 531/531 (92 suites)                            |
| keeper-app eslint   | error 0 (잔여 warning은 기존 exhaustive-deps)       |
| keeper-backend tsc  | PASS (0)                                            |
| keeper-backend jest | PASS 225/225 (32 suites, detail isActive 테스트 +1) |

## 명세 정합성 (요약)

type/images/isActive 3중 검증(zod↔nestjs-zod↔Prisma) 일치, 긴급=bootstrap 통합·하프시트 직렬(게이트 우선), 읽음·dismiss 로컬, list isActive 필터, detail/bootstrap 비활성 제외 — 모두 코드 반영 확인. 저장소는 AsyncStorage 미설치로 expo-secure-store(단일 배열 키)로 구현, 문서 정합화 완료.

## MCP 시뮬 (iOS, iPhone 17 Pro)

| 흐름                                                       | 결과                                                 |
| ---------------------------------------------------------- | ---------------------------------------------------- |
| 앱 부팅 — bootstrapSchema urgentNotice 필수화 후 fail-open | ✅ 정상 부팅(크래시 없음)                            |
| 홈 회귀 — SECTIONS notice 추가                             | ✅ 공지 데이터 없어 카드 미렌더, 기존 홈 정상        |
| 프로필 > 공지사항 라우트                                   | ✅ NavigateHeader + 빈 상태 렌더, 무크래시           |
| populated 리스트·type 뱃지·읽음 dimmed                     | ⏸ 수동 QA(로컬 BE 새 코드 재기동 + 공지 시드 필요)   |
| 상세 이미지 carousel/viewer                                | ⏸ 수동 QA(동상)                                      |
| 긴급 하프시트 present/dismiss/재노출                       | ⏸ 수동 QA(URGENT 시드 + bootstrap urgentNotice 필요) |

## 발견 사항

| 등급 | 항목                                                                               | 처리                                                                       |
| ---- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| P0   | —                                                                                  | 없음                                                                       |
| P1   | notice.service.detail() isActive 미필터 → 비활성 공지 id 직접 접근 노출(spec 위반) | **fix 완료** — `!notice.isActive` 가드 + 테스트 추가, backend jest 225/225 |
| P1   | 홈 pull-to-refresh에 noticeQueries 무효화 누락                                     | **fix 완료** — refreshCallback에 `noticeQueries.all()` 추가                |
| P2   | secure-store 키 명칭이 spec(`notice:read:<id>`)과 다름(배열 방식, 기능 동등)       | 문서 정합화 — spec/design을 secure-store 배열 키로 갱신                    |
| P2   | useUrgentNoticeGate useEffect deps present/dismiss                                 | 무처리 — provider가 useCallback 안정 참조 반환, 재실행 없음(안전)          |
| P2   | \_layout.tsx:139 exhaustive-deps 경고                                              | 무처리 — notice와 무관한 기존 경고                                         |

## 결론

P0 없음. P1 2건 fix·재검증 완료. 자동 테스트 양 레포 전체 통과. 코드 검증 + MCP 부팅/네비/빈상태 무크래시 확인. **데이터 의존 라이브 흐름(populated 리스트·상세 이미지·긴급 하프시트)은 로컬 백엔드 새 코드 재기동 + 공지/URGENT 시드 후 수동 QA 필요.**
