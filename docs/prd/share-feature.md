# PRD: 공유하기 (share)

> 입력: `docs/backlog/share-feature.md`(확정). 선행 스펙 `docs/spec/share-link.md`(OG 메타 API 계약).
> 범위: 기존 공유 위에 **딥링크 분기 · 공유 착지 페이지 · 진입점 일관성**을 얹어 공유를 end-to-end로 완성.
> 멀티 레포 의존: keeper-app(본문) · keeper-web · keeper-backend (web/backend는 FSD 범위 밖, 영향만 명시).

## 1. Problem / Why

공유는 일부만 작동한다.

- `useShare({type,id})`가 `our-keeper.com/share/{type}/{id}`를 만들지만, **그 링크를 눌러도 앱으로 들어오지 못한다** — universal/app link 미설정(현재 `keeper://` 커스텀 스킴만, 웹→앱 인터셉트 없음).
- **미설치자 착지점이 없다** — 링크를 받은 비사용자가 어디로 가는지 정의 안 됨.
- ~~community 공유 진입점 불일치~~ — **정정(design): 오인이었음.** community 공유는 `PostDetailHeader` ↗ 아이콘에 이미 노출, ⋮ 메뉴엔 신고/수정/삭제만. 3화면 진입점 이미 일관.

공유는 비영리 입양 플랫폼의 핵심 확산 경로(공고 1건이 더 많은 눈에 닿아야 입양 성사)다. 링크가 앱으로 안 들어오고 비사용자가 이탈하면 확산이 막힌다.

## 2. Goals

- 공유 링크 클릭 시 **설치자는 앱의 해당 화면으로 직행**한다.
- **미설치자는 공유 착지 페이지**에서 콘텐츠 프리뷰를 보고 설치로 유도된다.
- 공유 **진입점이 3개 상세 화면(공고·보호소·커뮤니티)에서 일관**된다.
- OG 미리보기가 공유 채널(카카오·문자 등)에서 제목·설명·썸네일로 바르게 노출된다.

## 3. Non-Goals (이번에 안 함)

- **Deferred deep link**(미설치 → 설치 후 원래 글 자동 복원) — Firebase DL 종료·Branch 유료, 1인 운영 과다. universal link + 랜딩으로 충분.
- **루트 랜딩(`our-keeper.com` 메인) 재설계** — 홍보 트랙, 별도. 앱 자체 공유(`type:'app'`)는 현행 루트 유지.
- **OG API 스키마 변경** — `share-link.md` 계약 유효.
- **공공 공고 이미지 미러링** — 원본 URL 사용(R2 절약, 기존 ADR).
- **스토어 직행(미설치 시)** — iOS Safari 제약 + 설치 동기 소실로 컷.

## 4. Functional Requirements

### P0

- **FR1 네이티브 딥링크 연결**: iOS `associatedDomains: ["applinks:our-keeper.com"]`, Android `intentFilters`(autoVerify) — app.config(CNG). 설치 앱이 `our-keeper.com/share/*`를 가로채 연다.
- **FR2 딥링크 수신 라우팅**: universal link / `keeper://` → expo-router path 매핑(`/share/adopt/{id}` → adopt 상세 등). 앱 내 화면 전환.
- **FR3 공유 착지 페이지**(keeper-web `/share/[type]/[id]`): OG 프리뷰 카드(이미지+제목+설명) + 단일 CTA("앱으로 열기"=universal link / 미설치 UA 분기 스토어) + `apple-itunes-app` Smart Banner(iOS) + Android JS "앱으로 보기" 버튼.
- **FR4 OG 메타**(keeper-web `generateMetadata`): `GET /shares/:type/:id` 조회 → og:title/description/image. 실패·404·이미지 없음은 로고+기본 설명 fallback.
- **FR5 백엔드 공유 API**(keeper-backend `GET /shares/:type/:id`): public, 부작용 없음(조회수·인증·연락처 X). 숨김 community/없는 대상은 NOT_FOUND. (`share-link.md` 계약)
- ~~**FR6 community 진입점 승격**~~ → **이미 충족 (no-op, design 정정)**: community 공유는 `PostDetailHeader` ↗에 이미 배선·노출, ⋮엔 신고/수정/삭제만. 3화면 일관 기구현 — keeper-app UI 작업 없음.

### P1

- OG 제목 패턴 보강(adopt: 품종·성별·나이 — Petfinder 패턴). community 연락처 미노출 재확인.
- `.well-known/` AASA·assetlinks.json 검증(앱 설치 후 링크 실제 가로채는지 디바이스 검증).

## 5. User Scenarios

- **설치자**: 카톡으로 받은 공고 링크 탭 → OS가 앱 가로챔 → 공고 상세 직행.
- **미설치자**: 같은 링크 탭 → 브라우저가 `/share/adopt/{id}` 착지 → 공고 프리뷰 + "앱 설치" → 스토어.
- **공유 주체**: 공고 상세 헤더 ↗ 탭 → OS share sheet → 채널 선택. (community도 동일 위치)

## 6. Backend Impact (keeper-backend, 별도 레포)

- `GET /shares/:type/:id` 신규(`share-link.md` 계약 그대로): `type: adopt|shelter|community`, 응답 `{type,id,title,description,imageUrl,appPath}`. DB 마이그레이션 없음(도메인 필드 파생).
- 코드 변경은 별도 레포 트랙 — 본 PRD는 계약 재확인까지.

## 7. Rollout

- **네이티브 빌드 필수**: FR1(associatedDomains/intentFilters)은 CNG → `prebuild` 재적용 + 컴파일로만 반영. OTA 불가, **이미 설치된 구버전 소급 불가 → 이번 빌드에 포함**.
- **다중 레포 동시 의존**: 완전 동작에 app(네이티브+라우팅) · web(`/share` 라우트 + `.well-known`) · backend(`GET /shares`) 셋이 함께 필요. 순서 권장: backend API → web 착지/메타/well-known → app 네이티브+라우팅 → 디바이스 검증.
- FR2·FR6(JS 라우팅·헤더 UI)은 빌드 후 OTA 가능하나, FR1과 한 빌드로 묶는 게 합리적.

## 8. ADR

- **미설치=랜딩 경유(스토어 직행 X)**: iOS Safari 제약 + 콘텐츠 프리뷰가 설치 동기 유지(딥링크 전환 2.5배, Adjust).
- **Deferred deep link 생략**: Firebase DL 2025-08 종료, Branch 유료. universal link + 랜딩으로 초기 충분.
- **community 헤더 승격**: 공유는 노출형 액션이 BP(HIG·당근·오늘의집). 3화면 일관.
- **루트 랜딩 분리**: 공유 확산과 결이 다른 홍보. 스코프 보호.
- **공유 전용 API**: 상세 API 직접 호출의 부작용(조회수·계약 결합) 회피(`share-link.md`).

## 9. Open Issues

- community 헤더에 ↗(공유) + ⋮(메뉴) 공존 시각 배치 → `/design`.
- universal link / `keeper://` → expo-router path 매핑 테이블 설계(FR2) → `/design` or `/spec`.
- `type:'app'` 공유 행선지 — 루트 랜딩 미재설계 동안 현행 정적 페이지 유지.
- AASA `appID`(team id + bundle id) ↔ 앱 entitlements 일치 검증(빌드 시).

## 10. Success

- 공유 링크 클릭 → 설치자 앱 진입률 / 미설치자 착지 페이지 → 스토어 전환(측정은 후속, 초기엔 정성 확인).
