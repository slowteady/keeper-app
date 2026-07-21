# 실종·분실 유저 작성(Phase 2) + 실종 전단(포스터) 생성

> 상태: 발산 완료(2026-07-14). 다음 `/prd`.
> 선행: 실종·분실 Phase 1(공공 데이터 열람)은 구현·출시됨(`docs/archive/community-missing/`, 읽기 전용). 포스터 파이프라인은 입양공고 대상으로 구현됨(`docs/archive/poster-template-share/`). 본 작업 = 유저 직접 작성 + 실종 전단 생성.
> 제외: AI 폼 prefill(이미지→폼 자동채움)은 이번 범위 밖 → 후속 `05-ai-poster-prefill` 로 연결.

## 배경 / 문제

Phase 1은 공공 실종 데이터를 **읽기 전용**으로 열람만 한다. 정작 내 아이가 사라졌을 때 **직접 실종글을 올리고 널리 알릴 수단이 없다.** keeper 정체성(정보·연결 플랫폼)상 실종은 "정보 게시 + 연결"의 대표 사례인데 그 진입점이 비어 있다. 동시에 실종 상황의 핵심 확산 수단인 **전단(포스터)**을 손으로 만들 필요 없이 글 데이터로 즉시 생성해주면, 오프라인 부착·SNS 확산까지 한 번에 이어진다.

## 추천안

### 형태

- **유저 실종글 작성/수정/삭제** — 사진(필수 다중)·이름·품종·성별·색/특징·실종일시·실종장소(지도)·보상(선택)·연락 방법.
- **발견매칭** — 상세에 "이 아이일 수 있어요": 이미 동기화 중인 `abandonment`(유기동물 공고) 룰 교차(품종·지역·발견일 ≥ 실종일). 외부 의존 0.
- **제보 루프** — 별도 목격 폼 없이 **그 글의 댓글로 제보**(대댓글 인프라 재활용, archive Q1 기결정).
- **실종 전단(포스터)** — 상세에서 "실종 전단 만들기" → 실종 전용 JSX 템플릿 렌더 → 작성자 다운로드 + 본인 SNS 공유.
- **상태** — 작성자 "찾았어요(해결)" 토글. 해결 시 목록 다운랭크 + 성공 표시.

### 결정된 방향 (발산 확정, 2026-07-14)

- **D1 연락/제보 = 전화 선택 노출 + 댓글 병행.** 실종은 즉시성이 생명이라 전화 직노출 니즈가 크지만 스팸·악용 리스크도 큼 → **작성자가 전화 공개 여부를 토글**. 공개 시 상세에 전화 CTA, 비공개면 댓글 제보로만. (PII 정책은 _분석 이벤트_ 금지지 표시 금지 아님. Phase1도 `/lost/:id/contact` 존재)
- **D2 발견매칭 MVP 포함.** 상세의 룰 교차 제안까지 MVP. 매칭 시 **푸시 알림**은 관심알림 인프라 재사용해 후속.
- **D3 데이터는 `Post` 인프라 상속, 표면은 실종 탭.** `PostType.MISSING` + `PostMissing` 서브모델 → 신고·댓글·블라인드 공짜 상속. 노출은 기존 `(untabs)/missing/` 유지(IA상 커뮤니티 아님, 저장과 surfacing 분리).
- **D4 범위 = 유저작성 + 포스터 한 묶음.** 포스터는 렌더 엔진 재활용 + 소스 어댑터만 추가라 같이 가는 게 효율적. 인스타 반자동(어드민)은 후속.

## 레퍼런스 BP

| 서비스                     | 패턴                                                                               | 왜 keeper에 맞나 / 컷 사유                                                       |
| -------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| PawBoost (report-lost-pet) | 필수 필드: 사진·이름/성별/품종/특징·최종목격·보상(선택)                            | 폼 필드 표준 그대로 채택                                                         |
| PawBoost 무료 전단 생성기  | 종별 템플릿, 폼→즉시 렌더. 6요소(LOST 헤드라인·컬러사진·특징·최종목격·연락처·보상) | 실종 전단 레이아웃 표준으로 채택                                                 |
| MissingPetPosters.com      | 실종 전단 전용 서비스 성립                                                         | 전단 니즈가 독립적으로 명확 → 포스터 MVP 포함 근거                               |
| Petco Love Lost            | AI 사진매칭(500+ 시각마커) 3000+ 보호소 교차                                       | **컷** — AI모델·인프라 비용 1인 운영 과함. keeper는 `abandonment` 룰 교차로 대체 |
| PawBoost 지역 알림망       | FB 지역페이지·이메일 구독자망 broadcast                                            | **컷** — 알림망 구축 범위 밖. 관심알림 재사용 후속으로                           |
| Nextdoor 실종 가이드       | 전화 직노출 + 게시 범위를 인증 이웃으로 제한                                       | 전화 노출의 즉시성 근거(→ D1 선택 노출)                                          |
| 당근 동네생활              | 전화 비노출 + 앱내 채팅(작성자만 개시)                                             | keeper는 앱내 채팅 없음 → 채팅 대신 댓글 제보 + 전화 선택 노출로 절충            |
| PawBoost 상태 체크인       | 이메일로 "아직 실종중?" → bump/다운랭크                                            | 서버 배치잡 저비용 → 후속(리마인더). MVP는 수동 토글                             |

## 데이터 모델 개요

- `PostType` enum에 `MISSING` 추가.
- **`PostMissing`** (신규) — `postId`(FK Post), `animalName?`, `species`/`breed?`, `gender?`, `colorFeature`(특징), `lostAt`(실종일시), `lat`/`lng`/`address`(실종장소), `reward?`, `contactPhone?`, `isPhonePublic`(전화 공개 토글), `status`(MISSING|RESOLVED), timestamps. 개인입양 `PostAdoptionPersonal` 컬럼 패턴 재활용.
- 사진 = 기존 이미지 업로드(presigned R2) 재사용.
- 신고/댓글 = `Post` 상위모델 상속(`PostReport`/`PostComment`/`isHidden`).
- 포스터 = `PosterSource`에 실종 variant 추가(discriminated union) + `toPosterSource(PostMissing)` 매퍼 + `GET /posters/missing/:id`. 렌더 엔진·R2·폰트·캐시는 재사용.

## 컷한 옵션

- **AI 사진 발견매칭**(Petco식) — 비용·인프라 1인 운영 과함. 룰 교차로 대체.
- **별도 목격/제보 폼** — 댓글로 흡수(archive Q1).
- **지역 알림 broadcast망**(PawBoost/FB) — 구축 범위 밖. 관심알림 재사용 후속.
- **인스타 자동 발행** — 실종글은 개인 UGC라 운영자 자동발행 주체 애매. 작성자 다운로드+본인 공유가 자연스러움. 어드민 반자동은 후속.
- **AI 폼 prefill** — 이번 제외, `05-ai-poster-prefill` 후속.
- **앱내 1:1 채팅** — keeper 미보유 인프라. 도입은 별도 큰 주제.

## 오픈 이슈 (TBD — /prd·/spec 에서 확정)

- `PostMissing` vs `LostAnimal`(공공) 목록 통합 노출 방식 — 실종 탭에서 유저글 + 공공글을 한 리스트로 섞나, 소스 뱃지로 구분하나.
- 발견매칭 정확도/오탐 — 룰 교차 임계(품종 동의어·지역 반경·기간) 및 "가능성" 표기 톤.
- 전화 공개 시 스팸 완화 — 로그인 유저만 열람 vs 노출 그대로.
- 해결(찾음) 후 데이터 — 즉시 숨김 vs 성공 스토리로 노출(입양후기 F-09와 연계 여지).
- 포스터 템플릿 세부 — 종별 분리 여부, 보상/연락처 노출 조건(전화 비공개면 전단엔?).

## 영향 (개요)

- **backend**: `PostType.MISSING` + `PostMissing` 모델·마이그레이션, missing 작성/수정/삭제/해결 mutation 모듈, 발견매칭 룰 쿼리, `PosterService` 실종 소스 어댑터 + 템플릿 + `GET /posters/missing/:id`.
- **app**: 실종 작성/수정 폼(작성폼·`location-bottom-sheet`·이미지업로드 재활용), 상세에 발견매칭 섹션·전단 생성/다운로드·해결 토글, 실종 탭 목록에 유저글 편입.
- **web(선택)**: 포스터 공유 착지(기존 share deeplink 재사용 여지).

## 출처

- [Report a Lost Pet | PawBoost](https://www.pawboost.com/report-lost-pet)
- [Free Lost Pet Flyer Maker | PawBoost](https://www.pawboost.com/tools/free-lost-pet-flyer-maker)
- [How to Make a Lost Pet Poster | PawBoost](https://www.pawboost.com/blog/how-to-make-a-lost-pet-poster/)
- [Missing Pet Poster Generator](https://missingpetposters.com/)
- [Petco Love Lost](https://petcolove.org/lost/)
- [Best practices: Lost pets | Nextdoor](https://help.nextdoor.com/s/article/Best-practices-Lost-pets?language=en_US)
- [당근 동네생활 채팅 FAQ](https://cs.kr.karrotmarket.com/wv/faqs/2154)
