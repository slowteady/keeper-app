# /review — 어드민 운영기능 + 앱 정지 소비 사이클

- 일자: 2026-06-23
- 대상: keeper-backend(정지 API·대시보드·앱설정) + keeper-admin(운영 페이지) + keeper-app(정지 게이트/인터셉터). 3레포 미커밋.
- 선행: `docs/qa/admin-ops.md`(/qa 통과). PRD/design/spec 없음(ad-hoc).
- 방식: 문서 완결성(메인) + code-reviewer·silent-failure-hunter·type-design-analyzer(병렬) + BP 정합(WebSearch).

## 판정: P0 없음 (통과)

서브에이전트가 올린 P0 2건은 메인 재판정으로 모두 해소:

- **jwt.strategy 예외 타입** → 정상 설계. `UserSuspendedException`=`BaseException`, `AllExceptionFilter`가 403+details 방출. 라이브 검증(`/users/me`→403 USER_SUSPENDED) 완료.
- **refresh() user-null fail-open** → `RefreshToken @relation onDelete: Cascade`라 user 삭제 시 세션도 삭제 → 유효 세션+user null 조합은 도달 불가(익스플로잇 불가). 단 fail-closed가 더 안전·login()과 일관 → **하드닝 적용**(아래).

## BP 정합

- **계정 정지 강제** ✅ 표준(per-request revocation 체크 + refresh token revoke) 충족 + 그 이상. keeper는 `JwtStrategy`가 매 요청 `user.status`를 DB 조회 → 표준의 "access token이 만료까지 유효한 취약 윈도우"를 제거. 정지 시 refresh token 전체 삭제. (FusionAuth/Auth0/Curity)
- 정지 UI 게이트(로그인/활성세션 양쪽), server-side 페이지네이션+debounce, role 승격+자기/마스터 잠금방지 = 표준 패턴 정합.
- cross-repo 계약(admin→backend→app 정지 페이로드) 3단 필드·타입 정확 일치(code-reviewer 검증).

## 수정 완료 (이번 review에서 fix + 재검증)

| 등급       | 항목                                               | 조치                                                                                      |
| ---------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| P2(하드닝) | refresh() user-null → 토큰 재발급 가능성           | `if(!user) throw UNAUTHORIZED` fail-closed, login()과 일관. refresh 정지/null 테스트 신규 |
| P1         | assertMutableTarget가 존재X id를 P2025(500)로 노출 | `if(!target) throw UserNotFoundException()` → 깔끔한 404. 테스트 추가                     |
| P1         | 인터셉터 removeToken 실패 시 정지 게이트 미표시    | `setSuspended`를 `removeToken` 앞으로 → 토큰 삭제 실패해도 게이트 보장                    |
| P1         | 어드민 catch가 에러 바인딩·로깅 없음               | 3개 핸들러 `catch(e){ console.error(e); ... }`                                            |
| P2         | interceptors.test act() 경고                       | `afterEach(act(()=>clearSuspended()))`                                                    |

검증: backend tsc0/jest 249·eslint prod0, app tsc0/jest(영향분)9·전체546, admin tsc0/eslint0.

## 잔여 (후속 — 미수정, 문서화)

| 등급 | 항목                                                                                                                                                                        | 위치                              | 사유                                                                                                                              |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| P1   | `toAdminUser` 명시적 반환타입 없음 + `...rest` passthrough — 향후 `ADMIN_USER_SELECT`에 민감필드 추가 시 자동 노출 위험. backend↔admin `AdminUser` 강제 계약 부재(드리프트) | user.service.ts / user-actions.ts | socialId 제거는 현재 구조적 보장. 명시 반환타입 + (생성/계약테스트)로 굳히면 좋음. 중간 공수                                      |
| P2   | app-config DEFAULTS storeUrl `''` → hard update 게이트 시 스토어 버튼 무반응(데드락)                                                                                        | app-config.service.ts             | ✅ 해소 — keeper-web env의 실제 스토어 URL을 DEFAULTS에 반영(iOS id6739178024 / com.keeper.love). bootstrap+app-config 14/14 통과 |
| P2   | `'admin-master'` 리터럴 3회(auth.service) + 별도 상수(user.service)                                                                                                         | auth.service.ts·user.service.ts   | 공유 상수 수렴 권장(드리프트 시 마스터 보호 무력화)                                                                               |
| P2   | `USER_STATUSES` 역방향 exhaustiveness 없음                                                                                                                                  | user.dto.ts                       | Prisma enum 추가 시 빌드 통과·기능 갭. 컴파일 가드 권장                                                                           |
| P2   | `updateUserStatusSchema` ACTIVE+suspendedUntil 허용(서비스가 null화)                                                                                                        | user.dto.ts                       | 의도면 OK. discriminated union으로 표현 가능                                                                                      |
| P2   | suspension 페이로드 `as` 캐스트(런타임 미검증), login onError 무로깅                                                                                                        | suspension.ts·use-login-sheet.tsx | zod 검증·logError 추가 권장                                                                                                       |

## 잔여 (범위 밖, 출시 전 필요)

- 백엔드 develop push(마이그레이션 prod 적용은 preDeploy 자동).
- RN 앱 정지 게이트 시각 시뮬(시뮬레이터 기동 필요) — 로직은 단위테스트+백엔드 라이브 검증 완료.
