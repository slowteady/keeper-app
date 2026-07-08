# PRD: 실종분실 — 공공 실종 데이터 파이프라인 + 열람 (Phase 1)

## 1. 메타

- 작성일: 2026-07-08
- 상태: 초안
- 입력 백로그: docs/backlog/features/05-community-missing.md (Phase 1)
- 관련 PRD: [[05-poster-template-share]] (실종 광역 확산 연계, 후속)
- 범위: **공공 데이터(lossInfo) 동기화 → 비-PII 저장 → 독립 실종 화면 열람 + 공식 채널 인계.** 배치는 커뮤니티 아님(`/design` §2 근거). 진입점(홈 히어로 등)·유저 작성글은 후속.

## 2. Problem / Why

- keeper 안에 **실종 동물을 볼 자리가 없다.** 커뮤니티는 QnA 소통 전용으로 정리됐고 실종 자리는 아예 없음(신규 필요).
- **공공 실종 신고를 볼 방법이 없다.** 실종 정보는 국가동물보호정보시스템(animal.go.kr)에 있지만 일반 유저는 거기까지 도달하지 않는다.
- 해결 안 하면: "실종 = keeper" 정체성이 형성되지 않고, Phase 2 유저 작성글도 빈 판 위엔 올라오지 않는다(콜드스타트).
- 근거: data.go.kr 분실동물 API(lossInfo, 15141910) 실호출 검증 — 활성 **257건**, 사진(popfile) 100%·특징(specialMark) 100%. keeper는 이미 유기동물/보호소 공공데이터를 동일 방식(배치)으로 운영 중이라 이식 비용 낮음.

## 3. Goals / Non-Goals

### Goals

- 공공 데이터로 **독립 실종 화면에 실질 콘텐츠(첫날부터 257건)** 를 채운다.
- **PII 무노출** — 신고자 실명/전화는 저장·표시하지 않고 안전하게 운영.
- 발견자를 **공식 채널로 최대한 인계**한다(keeper가 직접 재회는 못 시켜도 정확히 안내).
- Phase 2 유저 작성글이 얹힐 **살아있는 게시판**을 마련한다.

### Non-Goals

- **유저 실종/분실 글 작성** — Phase 2 별도 피처. (제보 댓글 루프·찾았어요 토글·위치 입력 포함)
- **좌표·지도핀** — lossInfo에 좌표 없음(주소 텍스트만). 지도는 Phase 2.
- **종(개/고양이) 필터** — `kindCd`가 자유 텍스트("진도견")고 상위분류 코드 없음 → 신뢰성 있는 분류 불가. 데이터가 못 받치는 필터는 만들지 않음.
- **"내 주변" 필터** — 당근식 행정동 계층으로 방향 확정하되, 사용자 "내 동네" 설정 + `happenAddr`→`regionCode` 지오코딩이 선행이라 Phase 1.5+. Phase 1은 최신순만.
- **진입점 최종 확정(홈 히어로/탭 승격)** — 기능 본체는 배치 무관 독립 화면. 진입점은 얇은 스왑 레이어로 후속(`/design` §2·§7).
- **발견 매칭(abandonment 교차)** — 후속 별도 트랙. 외부 의존성 0이나 Phase 1 범위 밖.
- **반경 푸시 알림** — 앱 전반 알림 시스템 별도.
- **callName / callTel 저장·노출** — 개인정보보호법상 동의 없이 재공개 불가(고지≠동의). 파이프라인 변환 단계에서 원천 드롭.

## 4. Success Metrics

- 정량:
  - 실종 화면 진입수 / 상세 진입율 (게시판 생명력 신호)
  - **"공식 확인" 아웃링크 클릭수** — keeper가 붙인 상수 링크의 클릭 = "실종 건에 반응해 행동했다" 신호. (데이터에 건별 링크가 없어 게시판 레벨이라 인계 강도는 약하나 행동 시그널로 유효)
- 정성: "실종 아이들이 여기 있네" 인지 — 죽은 탭 → 콘텐츠 있는 탭으로 전환.

## 5. User Scenarios

### 페르소나

- 일반 유저 — keeper 둘러보다(홈 진입) 실종 화면 진입.
- 발견자 — 길에서 동물을 봤고 주인을 찾아주고 싶은 유저.

### 시나리오 (Given-When-Then)

- Given 실종 목록 진입, When 목록을 본다, Then 공공 실종 공고가 **최신 실종일 순**으로 1컬럼 큰 사진과 함께 뜬다.
- Given 한 공고 상세 진입, When 정보를 본다, Then 사진·품종·색상·성별·나이·특징·지역·실종일이 보이고 신고자 개인정보는 **보이지 않는다.**
- Given 상세에서, When "국가동물보호정보시스템에서 확인"을 탭한다, Then 공식 분실신고 게시판으로 인계된다(외부 브라우저).
- Given 90일 지난/원본에서 사라진 공고, When 목록을 본다, Then 노출되지 않는다(유령 글 방지).

## 6. Functional Requirements

### P0 (MVP)

- **FR-1. 공공 데이터 동기화 배치.** As keeper, I want lossInfo를 정기 동기화하여, so that 실종 공고가 자동 유지된다.
  - AC: `@Cron` 일 1회 실행, `PUBLIC_DATA_SERVICE_KEY` 재사용, 페이지네이션 전량 수집(totalCount 기준).
  - AC: 변환 단계에서 `callName`·`callTel` **드롭**(DB 진입 차단).
  - AC: 고유 ID 없음 → 합성 dedup 키로 upsert(중복 미적재). 동일 키 다중 사진은 배열 병합.
  - AC: 이번 동기화에 없는 레코드 `isActive=false`. 실패/부분 실패는 로그 + 계속(기존 sync 패턴).
- **FR-2. 목록 조회 API + 화면.** As 유저, I want 실종 공고 목록을, so that 어떤 아이들이 실종됐는지 본다.
  - AC: `GET /lost` — `happenDt` desc, page/hasNext 페이지네이션(기존 abandonment 계약), `isActive=true` + `happenDt` 90일 이내만.
  - AC: **독립 스택 화면**(`(untabs)/missing`, 커뮤니티 아님). **1컬럼 full-width 카드** = 큰 사진 + 품종·지역·실종일(상대시간) + 특징 1줄(ellipsis). 로딩/빈/에러 상태 처리.
  - AC: 진입점은 최소 연결(검증용). 최종 진입점(홈 히어로)은 배치 무관해 후속.
- **FR-3. 상세 조회 API + 화면 + 공식 인계.** As 발견자, I want 상세 정보와 공식 채널 링크를, so that 주인 찾기에 기여한다.
  - AC: `GET /lost/:id` — 비-PII 전 필드 + 공식 게시판 URL(상수).
  - AC: 상세 = 큰 사진·식별정보(품종/색/성별/나이/특징)·지역·실종일 + "국가동물보호정보시스템에서 확인" 외부 링크.
  - AC: DTO에 `callName/callTel` 부재(타입 레벨 보장).

### P1 / Phase 1.5 (다음)

- **FR-4. "내 주변" 지역 필터** — 당근식 행정동 계층 확장(`읍면동→시군구→시도`). 선행: 사용자 "내 동네" 설정 + `happenAddr`→`regionCode` 지오코딩(기존 `features/address` Kakao infra 재활용).
- **FR-5. "봤어요 → 공식 발견신고" 안내.** 발견신고 공식 URL·플로우 검증 후 편입.

### P2 (나중)

- 종 필터, 발견 매칭(abandonment 교차), 홈 히어로 큐레이션 정식화·탭 승격, 실종일 정렬 옵션.

UX 화면: Figma 없음 — `/design` 단계에서 컴포넌트 카탈로그 기반 조립.

## 7. Data Model (확정)

신규 엔티티. 공공 데이터 전용(유저 글 Phase 2는 별도 테이블, 앱 목록에서 합류). **abandonment와 달리 고유 ID 없음 → 합성 키**, `kindCd/colorCd`는 코드가 아닌 한글 텍스트(매핑 불필요).

```
LostAnimal  (table: lost_animal)
- id           String   PK  @default(uuid(7)) @db.Uuid
- dedupKey     String   NOT NULL  UNIQUE   -- sha256(happenDt|happenAddr|kind|color|sex|age|specialMark)
- happenDt     DateTime NOT NULL  @db.Date  -- 실종일 (원본 "YYYY-MM-DD HH:mm:ss.S", 시간 00:00 → 날짜만)
- happenAddr   String   NOT NULL           -- 실제 주소 (지역 표시·요약 근거)
- happenPlace  String?                     -- 자유 묘사("언덕에 있음"), 보조
- kind         String   NOT NULL           -- 품종 텍스트("진도견")  [원본 kindCd]
- color        String?                      -- 색상 텍스트("흰색")   [원본 colorCd]
- sex          String?                      -- "M" | "F" | 기타      [원본 sexCd]
- age          String?                      -- "6살"
- specialMark  String?                      -- 특징
- orgNm        String?                      -- 관할기관
- photos       Json     NOT NULL @default([])-- popfile URL 배열(핫링크)
- isActive     Boolean  NOT NULL @default(true)
- firstSeenAt  DateTime NOT NULL @default(now())
- lastSeenAt   DateTime NOT NULL
- createdAt    DateTime NOT NULL @default(now())
- updatedAt    DateTime NOT NULL @updatedAt
```

- **저장 안 함(원천 차단): `callName`, `callTel`.**
- 인덱스: `@@index([isActive, happenDt])`, `dedupKey` UNIQUE.
- 관계: 없음(즐겨찾기 등은 Phase 밖).

## 8. Backend Impact

> v2 스택 = keeper-backend (NestJS + Prisma). keeper-api(구 MySQL 번호 마이그레이션) 아님.

### 마이그레이션

- Prisma 마이그레이션 신규 1건(timestamp) — `add_lost_animal`. `lost_animal` 테이블 생성.
- 적용: Railway preDeploy(`prisma migrate deploy`) 자동.

### 배치

- 신규 모듈 `src/batch/loss-sync/` — `abandonment-sync` 동형:
  - `loss-api.type.ts` (응답 타입), `loss-sync.service.ts`(@Cron·fetch·upsert), `loss-sync.converter.ts`(item→create, PII 드롭·dedupKey 계산), `loss-sync.module.ts`, `.spec.ts`.
  - `run-sync.ts` / 배치 모듈 등록에 편입.

### API / DTO

- 신규 모듈 `src/modules/lost/` — controller/service/dto:
  - `GET /lost` (목록, 커서), `GET /lost/:id` (상세).
  - Response DTO에 `callName/callTel` 부재. 공식 게시판 URL 상수 포함.

### 영향 범위

- **PII 정책**: callName/callTel은 저장 자체를 안 하므로 hard-delete/마스킹 대상 아님(애초에 미보유).
- 모더레이션: 공공 데이터라 신고/차단 대상 아님(유저 UGC 아님). Phase 2에서 유저 글에 적용.
- 앱: 독립 실종 화면 슬라이스 신규(entities/missing·widgets/missing-section·features/missing·(untabs)/missing). 커뮤니티 미변경, abandonment 상태분기 패턴 참고.

## 9. Rollout Plan (Phase)

### Phase 0: 선행

- lossInfo 활용신청 승인 키 확인(= `PUBLIC_DATA_SERVICE_KEY`로 실호출 200 검증 **완료**).

### Phase 1: MVP (이 PRD)

- FR-1~3 출시: 동기화 배치 + `/lost` API + **독립 실종 화면(1컬럼 목록·상세)** + 공식 게시판 인계. 진입점 최소 연결.
- 출시 신호: 화면에 공공 공고가 뜨고, 상세·아웃링크가 동작.

### Phase 1.5: 내 주변 + 진입점

- FR-4(당근식 지역 필터) + 홈 히어로 큐레이션 진입점 정식화.

### Phase 2: 확장

- 유저 작성글([Q1~Q6] 결정 기반, 별도 PRD) + 공공/유저 목록 합류 + "공공 신고" 배지 실효화.
- FR-4(발견신고 안내) 검증 후 편입.
- 출시 신호: 유저 작성 유입 시작 → 공공 시딩은 마중물로 비중 감소.

## 10. ADR (Decision Log) + Open Issues

### 결정 기록

| 결정          | 옵션                                       | 채택             | 사유                                                                                           |
| ------------- | ------------------------------------------ | ---------------- | ---------------------------------------------------------------------------------------------- |
| lossInfo 채택 | 컷(자체 UGC만) vs 채택(공공 진입점)        | 채택             | 컷 근거 "사진 없음" 반증(사진 100%·257건). 입양의 공공/유저 이원 구조와 대칭 → 콜드스타트 해결 |
| PII 처리      | 마스킹 노출 vs 고지 후 노출 vs 원천 미저장 | 원천 미저장      | 고지≠동의, 동의 없는 재공개 위반(5년/5천만원). 1인·비영리가 불확실 예외에 기댈 이유 없음       |
| 인계 방식     | 건별 딥링크 vs 상수 게시판 링크            | 상수 게시판 링크 | 데이터에 건별 ID·URL 없음(실측). 게시판 레벨이 실현 가능 최대치                                |
| 종 필터       | 포함 vs 컷                                 | 컷(P2)           | kindCd 자유 텍스트·상위분류 없음 → 신뢰성 있는 분류 불가                                       |
| 범위          | 유저작성 포함 vs 공공만                    | 공공만(Phase 1)  | 작은 검증 가능한 첫 배포 + UGC 리스크 분리                                                     |
| 발견신고 CTA  | P0 vs P1                                   | P1               | 공식 URL·플로우 미검증. 검증 전 P0 편입 안 함                                                  |

**추가 결정(2026-07-08 배치 재설계):** 배치 = 커뮤니티 서브탭 대신 **독립 화면 + 진입점 보류**(내부/외부/탭개수 BP 3중 수렴) / 목록 = **1컬럼 큰 카드**(2컬럼은 사진 작아 식별 불가) / "내 주변" = **당근식 행정동 계층**(regionCode 3단계, Phase 1.5) / 페이지네이션 = **page/hasNext**(기존 계약 재활용).

### Open Issues

- 진입점 최종형(홈 히어로 큐레이션 vs Phase 2 탭 승격 vs 병행) — Phase 2 확정.
- "내 주변" 선행조건(사용자 "내 동네" 설정 저장 위치: 온보딩 vs 프로필) — Phase 1.5.
- 동일 실종 신고가 사진별 다중 item으로 오는지 실 데이터로 최종 확인(dedup 병합 검증) — `/spec` 단계 샘플 조사.
- 공식 발견신고 페이지의 안정적 URL/파라미터 존재 여부(FR-4 P1 승격 조건).
- popfile 이미지 URL(`openapi.animal.go.kr`) 안정성/핫링크 지속성 — 불안정 시 R2 재호스팅 여부(Phase 2 검토).

## 참고

- 백로그 원본: `docs/backlog/features/05-community-missing.md`
- 공식 인계 대상: https://www.animal.go.kr/front/awtis/loss/lossList.do
- API: data.go.kr 15141910 (`apis.data.go.kr/1543061/lossInfoService/lossInfo`)
- 참조 구현: keeper-backend `src/batch/abandonment-sync/`
