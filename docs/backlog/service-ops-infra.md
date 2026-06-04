# 서비스 운영 인프라 — 점검 모드 / 강제 업데이트 / 운영자 알림

> 상태: **강제 업데이트 게이트(2번) = 이번 출시 P0 착수 확정** (2026-06-04 딥리서치 완료 → 자체 백엔드 구현). 소급 적용 불가라 이번 빌드 필수. **점검 모드(1번)는 같은 부트스트랩에 통합.** 운영자 알림+admin(3번)은 P1.

## 배경

- EC2(입양공고·보호소 공공데이터 제공) → Railway 마이그레이션 + **로그인·커뮤니티 신규 추가**.
- 운영 중 배포/점검, 구버전 앱 차단, 신고·공지 등 운영 업무 처리가 필요해짐.
- 운영 BP 딥리서치 완료 (RN/Expo, 소규모 서비스 기준). 아래는 그 결론 + keeper 적용 방향.

---

## 1. 점검 모드 (maintenance mode)

**목적**: 백엔드 점검/장애 시 앱 진입을 막고 "점검 중" 안내 화면 표시.

**조사 결론**

- 표준: **원격 플래그**(서버 config 또는 `/health`·`/status` 엔드포인트) → 앱 시작 시 체크 → **닫을 수 없는 점검 화면**. 스토어 업데이트 없이 켜고 끔.
- ⚠️ **안티패턴**: 앱 심사 기간에 백엔드를 끄면 placeholder/크래시로 간주되어 **Apple Guideline 2.1 리젝**. 심사 중엔 백엔드를 켜둘 것.
- 소규모도 "안전망"으로 권장. 단 keeper는 EC2→Railway 전환이 무중단 가능(공공데이터 재적재 + 신규기능)이라 **실사용 빈도는 낮은 비상용**.

**작업(예정)**: **통합 부트스트랩(2번)에 흡수** — 같은 `GET /bootstrap` 응답의 `maintenance` 플래그로 점검 화면 분기 (우선순위 maintenance > hard > soft > none).

**출처**: Firebase Remote Config, Apple App Store Review Guidelines 2.1.

---

## 2. 강제 업데이트 (force update) ⭐ 우선 검토

**목적**: API 호환이 깨지는 변경 시 구버전 앱 사용자를 차단/업데이트 유도.

**조사 결론**

- 표준: 서버가 **`minimum supported version`** 반환 → 앱 시작 시 자기 버전과 비교 → **soft(닫기 가능, 권장)** / **hard(닫기 불가, 강제)**. iOS는 앱스토어로 보내기, Android는 Play Core In-App Updates.
- ⭐ **핵심**: 버전 게이트 로직은 **초기에 빌드에 넣어야** 한다. 이미 배포된 구버전 앱에는 게이트가 없어 **나중에 소급 적용 불가**(사전 OTA 채널이 있어야만 가능).
- **API 호환 깨지는 변경(= Railway 마이그레이션, 커뮤니티 스키마 변경 등)** 시 hard update로 구버전 차단.
- **EAS Update(OTA)**: JS/에셋은 무중단 배포 가능하나, 네이티브/권한/SDK 변경은 새 빌드 필요. **OTA는 강제 업데이트엔 부적합**(로딩을 차단하지 않음) → 프로그래매틱 버전 게이트를 별도로 둬야 함.

**작업(예정)**: 서버 min-version API + 앱 부트스트랩 버전 비교 + soft/hard 안내 화면 + 스토어 이동. **이번 업데이트 빌드에 게이트만이라도 심는 것 권장.**

**출처**: Expo EAS Update docs(`runtime-versions`, `download-updates`), Android Play Core In-App Updates, appsidekit.

**결정 확정 (2026-06-04, 딥리서치 24/25 검증)** — [[project_force_update_gate]]

- **자체 백엔드** (`app_config` 단일 테이블). Firebase Remote Config 미도입 — 관리 파이프라인 분산·네이티브 의존성(`@react-native-firebase`) 회피. keeper는 자체 백엔드 이미 있고 운영자=개발자라 Firebase 강점(백엔드 부재/퍼센트 롤아웃/비개발자 GUI) 미해당.
- **통합 부트스트랩** `GET /bootstrap`(public): 점검+버전 한 응답. 우선순위 maintenance > hard > soft > none.
- **서버 판정**: 클라가 platform+version 전송 → 서버가 semver 비교해 `updateType`('none'|'soft'|'hard') + storeUrl 내려줌. 클라는 렌더만 → 정책 변경이 서버 배포만으로 끝(앱 재배포 X).
- **fail-open**: API 도달 불가/오프라인 시 통과(가용성). 의도적 차단은 점검 모드만.
- **순수 JS DIY**: expo-application(`nativeApplicationVersion`, app config `version` 기준) + `semver`(포맷검증 필수) + 자체 update-wall 화면 + Linking 스토어 이동. in-app-update 라이브러리 미사용(스토어 최신버전 체크라 자체 min-version 판정과 충돌 + 네이티브 의존성). iOS는 네이티브 강제업데이트 API 부재라 어차피 자체 게이트.
- 클라 UX: hard=닫기 불가(단 force-quit 금지, Apple 심사), soft=닫기 가능+빈도제한(하루 1회, secure-store `lastPromptedAt`). 스토어 딥링크 iOS `itms-apps://` / Android `market://`(https 폴백).
- **admin 수정**: 출시엔 Prisma Studio 또는 보호된 `PATCH /admin/app-config`. admin UI는 P1(신고 백오피스와 함께).
- ⭐ **소급 불가** → 게이트는 이번 출시 빌드에 반드시. 게이트 없는 첫 릴리스는 영원히 강제 불가.

---

## 3. 운영자 알림 (admin push) — 앱 내 권한(role) 기반

**목적**: 신고 접수/공지 등록 같은 운영 이벤트를 **admin 권한 계정에게 실시간 알림**.

**방향 (결정됨)**: Slack/Discord 웹훅이 아니라 **keeper 앱 자체 푸시**로. admin 권한 유저가 keeper 앱에서 알림 수신.

- 유저에 `role`(admin) + `push_token` 저장.
- 이벤트 발생(신고 등) → 서버가 **admin role 유저들의 토큰으로 Expo Push 전송** → admin 폰 keeper 앱에 알림.
- admin 관리 화면 자체는 웹으로 두고, **알림 수신만 admin 계정으로 로그인한 keeper 앱**이 담당(채널 분리 패턴).

**작업(예정)**: 유저 `role` + push token 저장 → 신고/공지 이벤트 훅 → admin 대상 Expo Push. admin 웹 페이지(공지 관리, 신고 처리)는 별도.

**출처**: Expo Push Notifications. (Slack/Discord incoming webhook은 대안이나 "내 앱으로 받기" 요구로 미채택.)

---

## 권장 우선순위

1. **강제 업데이트 버전 게이트** — 출시 전/이번 빌드. 소급 적용 불가라 가장 시급.
2. **점검 모드** — 비상용 안전망.
3. **운영자 알림 + admin 페이지** — 커뮤니티 운영 본격화 시점.
