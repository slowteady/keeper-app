# 입양 라이프스타일 매칭 Quiz

> 작성일: 2026-05-24
> 상태: 기획 — 사이드프로젝트, Keeper 자연 확장 후보
> 우선순위: 1순위 (mission align + Keeper 시너지 강함)

---

## 1. Vision

**한 줄**: 입양 후 파양 ZERO. 강아지·가족·보호소 모두가 win.

### 풀고 싶은 문제

한국 유기견 매년 약 11만 마리 구조 ([2022 기준](https://www.qia.go.kr/viewwebQiaCom.do?id=60528)), 입양율 27.5%·안락사율 16.8%. **입양된 후 30%가 파양** (업계 추정) → 다시 보호소로 → 안락사 risk 두 번.

원인: **임시 호감·외모만 보고 입양 → 라이프스타일·강아지 성향 mismatch → 실제 양육 어려움**.

소프트웨어로 해결 가능: **사전 quiz로 매칭 정확도 ↑ → 파양율 ↓**.

---

## 2. Target user

| 우선순위 | user                   | 사용 동기                                    |
| -------- | ---------------------- | -------------------------------------------- |
| 1차      | 입양 희망자            | 내게 fit한 강아지 찾기 + 입양 후 양육 자신감 |
| 2차      | 보호소·구조단체        | 매칭된 입양인 connect = 입양 success rate ↑  |
| 3차      | Keeper·포인핸드 사용자 | cross-promotion                              |
| 4차      | 펫 인플루언서·언론     | "입양 전 quiz 받으세요" 콘텐츠               |

---

## 3. 핵심 기능

### 3.1 Quiz — 10~15문항 (PawsLikeMe 4 quadrant 모델)

**거주·환경** (3문항)

- 주거 형태 (아파트·단독·빌라·원룸)
- 자가 vs 전세 (이사 시 강아지 동반 가능성)
- 야외 공간 (마당·베란다·공원 인접)

**가족·생활** (3문항)

- 가족 구성 (1인·부부·아이·노부모)
- 다른 반려동물 (강아지·고양이·소동물)
- 출근 형태 (재택·9-6·교대·프리랜서)

**라이프스타일** (3문항)

- 평일 집에 있는 시간
- 주말 외출·여행 빈도
- 산책 가능 시간 (1일 30분 / 1시간 / 2시간+)

**경험·capacity** (3문항)

- 반려동물 키워본 경험
- 훈련 의지 (분리불안·짖음 등)
- 월 예산 (사료·병원·미용)

**선호** (3문항)

- 활동성 선호 (활발 vs 정적)
- 크기 선호 (소형·중형·대형)
- 알러지·특이사항

### 3.2 매칭 알고리즘

**1단계 — 사용자 4 quadrant 산출** (PawsLikeMe 모델 차용)

- **Energy**: 활발 ↔ 정적
- **Confidence**: 자신감 ↔ 소심
- **Focus**: 집중 ↔ 산만
- **Independence**: 독립 ↔ 애착

**2단계 — 강아지 4 quadrant 매핑**

- 보호소·구조단체가 강아지 등록 시 같은 4축 score 입력
- 또는 행동 description (활발·온순·낯가림 등)에서 자동 추출

**3단계 — 매칭 score**

```
매칭 score =
  quadrant 일치도 × 0.4
+ 견종·크기 호환 × 0.2
+ 나이 호환 (사용자 capacity 기반) × 0.15
+ 활동량 매치 × 0.15
+ 인근 보호소 거리 × 0.1
```

**4단계 — top 5 추천**

- 점수순 + 다양성 (한 보호소 편향 X)
- 각 강아지: "왜 fit인지" 자연어 설명 (GPT-4o 사용)

### 3.3 결과 화면

```
[당신의 강아지 친구 추천]

🥇 토리 · 3살 · 8kg · 포메 믹스
   매칭 score 92%
   ✓ 당신의 차분한 환경과 토리의 온순함 fit
   ✓ 1일 1시간 산책 가능한 활동량
   📍 경기도 안성 보호소 · 입양 가능
   [보호소 link · 관심 표시]

🥈 보리 · 1살 · 5kg · 믹스 ...
...

[매칭 안 되는 강아지]
> 너무 큰 강아지·매우 활발한 견종은 현재 라이프스타일과 fit 어려움
> 단 1년 후 환경 변화 시 다시 quiz 받아보세요
```

### 3.4 Keeper 연동

```
[Keeper 공고 list] ─── "내게 맞는 강아지 찾기" CTA ───┐
                                                     ▼
                                              [매칭 Quiz]
                                                     │
                                                     ▼
                                              [매칭 결과]
                                                     │
                                                     ▼
                                  ─── Keeper 공고로 다시 link ───
                                  ─── 보호소·구조단체 connect ───
```

- 매칭 결과의 강아지 데이터 source = Keeper·국가동물보호정보시스템·포인핸드
- "관심 표시" → 보호소·구조단체에 알림 → 입양 conversation 시작

### 3.5 입양 후 Follow-up

| 시점        | 액션                                                     |
| ----------- | -------------------------------------------------------- |
| 입양 당일   | 가이드 푸시 ("첫 24시간 가이드")                         |
| 7일         | "분리불안·배변·낯가림 어떻게 되나요?" 체크인             |
| 30일        | 상세 후기 요청 + 산책 매칭 product 권장 (Keeper Friends) |
| 60일        | 건강 상태·예방접종 reminder                              |
| 90일        | 매칭 quiz 정확도 평가 → 알고리즘 개선                    |
| 6개월 / 1년 | "토리 잘 지내고 있나요?" 일기 prompt                     |

---

## 4. 데이터 model

### Entity 4개

**User (입양 희망자)**

- id, 카카오 로그인 hash
- quiz_responses (JSON)
- quadrant_score (Energy·Confidence·Focus·Independence)
- 동네·연락 동의

**Dog (강아지)**

- id, 이름·견종·나이·체중·사진
- quadrant_score (보호소 입력 or 자동 추출)
- 보호소 id, 입양 상태 (대기·진행·완료·파양)
- source: 'keeper' | 'animal.go.kr' | 'pawinhand'

**Match (매칭 결과)**

- user_id, dog_id, 매칭 score, 매칭 일시
- 사용자 액션: 'viewed' | 'interested' | 'contacted' | 'adopted' | 'rejected'

**FollowUp**

- match_id (adopted 상태)
- 시점별 체크인 데이터 (분리불안·배변·만족도)
- 파양 시 사유

---

## 5. 기술 스택

- **Frontend**: Next.js 15 + Tailwind (온스케줄과 동일 stack — 디자인 시스템 reuse)
- **DB·Auth**: Supabase (PostgreSQL + 카카오·애플 OAuth)
- **Storage**: Supabase Storage (강아지 사진)
- **Push**: FCM
- **알고리즘**: TypeScript 로직 (단순 weighted scoring 시작)
- **AI 설명**: OpenAI GPT-4o (매칭 이유 자연어 생성)
- **공공데이터**: 국가동물보호정보시스템 OpenAPI cron fetch (Vercel Cron)
- **호스팅**: Vercel

---

## 6. Reference 모델 (PawsLikeMe)

[PawsLikeMe](https://pawslikeme.com/) — 4 quadrant 모델

- 3분 quiz
- 4가지 Core Personality (Energy·Confidence·Focus·Independence)
- "Dating site식 알고리즘" 자처

[Petfinder Compatibility Quiz](https://www.petfinder.com/pet-selector/dog-quiz/) — 라이프스타일 + 견종 매칭
[OmniPawHub](https://www.omnipawhub.com/pet-matchmaker/) — 200+ breed 알고리즘
[PAWS Chicago ComPETibility Quiz](https://www.pawschicago.org/our-work/pet-adoption/adoption-process/competibility-dog-quiz)

---

## 7. 검증 path

### Phase 1 — Quiz prototype (1~2주)

- 10문항 quiz + 가짜 강아지 데이터 10마리
- 매칭 알고리즘 가벼운 구현
- 본인 + 친구 5명 테스트

### Phase 2 — Keeper 데이터 연동 (2~4주)

- Keeper API or 공공데이터 fetch
- 실제 강아지 데이터로 매칭 운영
- 시드 user 50명 (Keeper user 일부 + 본인 SNS)

### Phase 3 — 보호소·구조단체 연결 (2~3개월)

- 보호소에 매칭된 입양인 알림
- 입양 follow-up 자동화
- 100명 user

### Phase 4 — Paramount 데이터 누적 (6개월~)

- 입양 follow-up → 파양율 측정
- "매칭 quiz 사용 입양 vs 일반 입양" 파양율 비교
- 데이터로 효과 입증 → 언론·정책·기부 leverage

---

## 8. Risk·완화

| risk                                 | 완화                                                                  |
| ------------------------------------ | --------------------------------------------------------------------- |
| **알고리즘 정확도** (초기 데이터 X)  | PawsLikeMe 모델 차용 + 단순 weighted scoring 시작 → 데이터 누적 후 ML |
| **사용자 quiz 중간 abandonment**     | 10~15문항 사이, progress bar, 결과 화면 매력적 design                 |
| **보호소 강아지 quadrant 입력 부담** | 보호소가 manual 입력하면 fail → 행동 description에서 GPT-4o 자동 추출 |
| **fail 매칭** (현재 fit 강아지 없음) | 솔직히 표시 + "알림 신청" → 새 강아지 등록 시 알림                    |
| **Keeper 강아지 데이터 부족**        | 국가동물보호정보시스템·포인핸드 OpenAPI 결합                          |
| **매칭 후 보호소 응답 안 함**        | 보호소 측 UX 따로 (받침판·이메일·SMS) 단계적 개선                     |

---

## 9. 수익 model (사이드 = 0)

### mission product 정체성 = 무료 유지

### 잠재 (검증 후, 사용자가 본격화 시)

- **후원·기부** (Patreon 한국·토스 후원·카카오 같이가치)
- **affiliate** (입양 가족 추천 사료·간식·용품)
- **boost** (보호소·구조단체가 본인 강아지 우선 노출 — 윤리 우려, **비추**)

→ **수익화는 trust·brand 다 쌓은 후에만**. 초기에 결제 도입 시 mission product 정체성 훼손.

---

## 10. Brand·운영

### 이름 후보

- **"Keeper Match"** — Keeper 자연스러운 확장 (1순위 추정)
- **"강아지가 fit하다"**
- **"입양 콤파스"**
- **"무지개 매칭"** (다소 무거움)

### 운영 form

- Keeper 앱 내 모듈 (1순위) — 별도 product X, brand·user 통합
- 또는 별도 web (Keeper와 cross-link)

### 콘텐츠 marketing

- 블로그·뉴스레터: "입양 전 체크리스트", "분리불안 줄이는 5가지" 등 SEO 콘텐츠
- 입양 가족 스토리 (follow-up data 누적되면)
- 언론 인용 — 파양율 데이터 입증 후

---

## 11. 다음 step

- [ ] Keeper와의 결합 방식 결정 (앱 내 모듈 vs 별도 web)
- [ ] PawsLikeMe 4 quadrant 모델 deep study + 한국 fit 검토
- [ ] Quiz 10문항 초안 작성
- [ ] 매칭 알고리즘 v0 (weighted scoring)
- [ ] 본인 + 친구 5명 종이 prototype 테스트
- [ ] 1~2주 web prototype 빌드
