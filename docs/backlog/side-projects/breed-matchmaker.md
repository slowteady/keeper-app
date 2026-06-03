# 견종 매칭 Quiz (viral entertainment + Keeper funnel)

> 작성일: 2026-05-24
> 상태: spec v1 (working level)
> Form: **별도 web (viral entertainment)** + Keeper로 funnel
> 우선순위: Keeper cold start 해결책으로 매우 강력

---

## 한 줄

**사람의 15문항 quiz (+ MBTI optional) → 잘 맞는 견종 추천 → Keeper로 funnel.**

진지 매칭 quiz (`adoption-quiz-spec.md`)와 별개·보완 product. Funnel:

```
viral entertainment quiz → Keeper 인지 → Keeper 진지 매칭 → 실제 입양
```

---

## 1. 차별 (한국 시장 vs 우리)

### 한국 이미 있는 강아지 MBTI 5~6개

- [VonVon "나와 잘 어울리는 강아지는?"](https://kr.vonvon.me/quiz/38)
- [DogBTI](https://dogbti.tk/) · [Petrico](https://petrico.site/mbti/) · imtest.io · test-it.co.kr · CAMI

### 다 entertainment로 끝, Keeper 같은 진짜 funnel X

### 우리 차별 4가지

1. **15문항 + MBTI optional** (대부분 5~10문항 vs 우리 깊이)
2. **학술 base** (AKC C-BARQ · PawsLikeMe 4축)
3. **Keeper funnel** — 결과 → "지금 입양 가능한 ~ type 유기견"
4. **운영자 brand** (Keeper 운영자가 만든 진정성)

---

## 2. Quiz 15문항 (확정)

### A. 라이프스타일·환경 (Q1~Q5) — Hard filter

```
Q1. 어디서 살아요?
- 아파트 (10평 미만 / 10~20평 / 20평+)
- 단독·빌라 (마당 없음 / 마당 있음)
- 원룸·오피스텔

Q2. 산책 환경?
- 공원 도보 5분 이내
- 공원 도보 15분 이내
- 산책로만 있음
- 산책 환경 어려움

Q3. 평일 집에 있는 시간?
- 거의 종일 (재택)
- 절반 (4~8시간)
- 짧음 (2~4시간)
- 거의 없음 — 출퇴근

Q4. 산책 가능 시간?
- 1일 2시간+
- 1일 1시간
- 1일 30분
- 30분 미만

Q5. 가족 구성?
- 1인 / 부부 / 어린이 있음 / 노부모 / 다른 반려동물
```

### B. 본인 성격·일상 (Q6~Q10) — 4축 score base

```
Q6. 친구·모임 좋아하는 편?
- 많을수록 좋음 (외향) → 균형 → 소수 깊게 → 혼자 편함 (내향)

Q7. 계획 vs 즉흥?
- 철저한 계획 → 대략 계획 → 즉흥 → 흐름대로

Q8. 집에서 보내는 시간?
- 활동적 (운동·요리·취미)
- 균형 (TV·독서·휴식 섞임)
- 정적 (책·영화·휴식)

Q9. 인내심 (반복·시끄러움)?
- 매우 좋음 → 보통 → 약함 → 매우 약함

Q10. 청결·정리?
- 매우 깔끔 → 보통 → 약간 헐렁 → 털·먼지 신경 안 씀
```

### C. 강아지 선호 (Q11~Q15) — Hard filter

```
Q11. 강아지 크기?
- 소형 (~7kg) / 중형 (7~20kg) / 대형 (20kg+) / 무관

Q12. 나이?
- 어린 / 청년 / 중년 / 노령 / 무관

Q13. 활동 선호?
- 활발 / 균형 / 정적

Q14. 훈련 의지?
- 적극 / 기본 OK / 시간 부족 / 자신 X

Q15. 행동 문제 다룰 자신? (짖음·낯가림·물림)
- 어떤 행동도 OK / 가벼움 OK / 사회화된 강아지 / 절대 X
```

→ **3분 30초** 안에 끝남.

### D. MBTI Optional

```
"MBTI 알아요?"
[네 - 입력]  [몰라요 - 건너뛰기]

(YES → MBTI 16유형 중 선택)
```

→ skip OK, 입력 시 매칭 정확도 +10~15%.

---

## 3. 매칭 알고리즘

```typescript
function computeUserScore(quiz, mbti?) {
  // 1. 15문항 → 4축 score
  const base = {
    energy: weighted([Q4, Q8, Q13]), // 활동량
    confidence: weighted([Q6, Q9, Q15]), // 외향·인내·문제
    focus: weighted([Q7, Q10, Q14]), // 계획·정리·훈련
    independence: weighted([Q3, Q6]) // 집 시간·내향
  };

  // 2. MBTI 가중 (optional, weight 30%)
  if (mbti) {
    const adj = MBTI_ADJUSTMENT[mbti];
    base.energy += adj.energy * 0.3;
    base.confidence += adj.confidence * 0.3;
    base.focus += adj.focus * 0.3;
    base.independence += adj.independence * 0.3;
  }

  return clamp(base, 0, 100);
}

function matchBreed(userScore, breeds) {
  return breeds
    .filter(hardFilter) // 크기·나이·아이 fit
    .map((b) => ({
      breed: b,
      score: 100 - euclidean(userScore, b.score) / 2
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
```

### MBTI ↔ 4축 매핑 (예시)

| MBTI        | Energy | Confidence | Focus | Independence |
| ----------- | ------ | ---------- | ----- | ------------ |
| ENFP        | +20    | +15        | -10   | -5           |
| INFP        | -10    | -5         | +5    | +15          |
| ENTP        | +20    | +20        | -15   | +5           |
| INTP        | -15    | -10        | +20   | +20          |
| ESTJ        | +10    | +20        | +20   | -5           |
| ISTJ        | -10    | +10        | +25   | +10          |
| ... (16 다) |        |            |       |              |

---

## 4. 견종 데이터 source — 검증 결과

### 4.1 사용 가능 source (검증 완료 2026-05-24)

| Source                                                                                                        | 검증 결과        | 비고                                                                                                             |
| ------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| **[dog_traits_AKC](https://github.com/kkakey/dog_traits_AKC)**                                                | ✅ **즉시 사용** | AKC trait **1~5 score 이미 처리**, CSV format. Energy·Trainability·Affectionate·Openness 등 4축 매핑에 거의 완벽 |
| **[akcdata](https://github.com/tmfilho/akcdata)**                                                             | ✅ 보완          | **277 견종**, 20 features, 인기도·키·무게·기대수명·AKC 그룹 등                                                   |
| [TheDogAPI](https://docs.thedogapi.com/)                                                                      | ⭐ 보완          | JSON REST, 일부 한국어 localization                                                                              |
| [C-BARQ FigShare](https://figshare.com/articles/dataset/C_BARQ_survey_on_dog_behavior_and_temperament/715896) | 학술 backup      | 12,000 dogs, 학술 grade                                                                                          |

### 4.2 결정적 gap 4가지 ⚠️

#### Gap 1: AKC ↔ Keeper `kindCd` 명칭 매핑

- AKC = 영어 명·미국 등록 견종 (Poodle·Shih Tzu)
- Keeper = 한국 공공데이터 견종 코드 (한국식 명·코드)
- → **매핑 work 필요** (GPT-4o batch + 본인 검수)

#### Gap 2: 믹스견 (가장 큰 문제) ★

- **한국 보호소 60%+ 믹스견**
- AKC 데이터에 X = 직접 매칭 불가
- 입양율도 가장 낮음 = mission 영역에서 가장 중요

#### Gap 3: 한국 견종 (진돗개·풍산개·삽살개·동경이·도사)

- AKC 등록 X 또는 일부만 (Jindo는 AKC FSS 등록)
- 별도 source 필요
  - 한국애견협회 견종 표준 (외형 위주)
  - 우리 직접 입력 (10~20개)

#### Gap 4: Keeper kindCd 정확한 spec

- 사용자(Keeper 운영자)만 정확히 알음
- list 공유 받으면 즉시 매핑 가능

---

## 4-A. 데이터 처리 Plan (AI API 활용)

### Plan A — GPT-4o로 견종명 매핑 (1주, ~₩3,000)

```
Keeper kindCd list (한국어)
         │
         ▼
GPT-4o batch translation + AKC 매핑
         │
         ▼
[mapped CSV]
한국명 · kindCd · AKC breed · 4축 score
시추 · 422 · Shih Tzu · {energy:35, trainability:30, ...}
포메 · 425 · Pomeranian · {energy:60, trainability:55, ...}
진돗개 · 432 · Jindo (수동 입력) · {...}
믹스견 · 488 · ❌ (별도 처리 → Plan B)
```

### Plan B — 믹스견 처리 (단계적 접근)

**현실 reality**: 믹스견 = 한국 보호소 60%+, 매칭 불가능 시 product 가치 ↓.

#### Phase 1 (MVP) — **단순 처리** (1순위 추천)

믹스견 = 별도 카테고리, 매칭 알고리즘에서 다음 적용:

- **체중 + 크기 + 추정 견종 (보호소 입력 specialMark)** 만으로 4축 score 추정
- rule-based 매핑 (예: 작은 믹스 + "온순" specialMark → 시추 type score 차용)
- 매칭 정확도 약간 ↓, 단 **즉시 구현 가능**

#### Phase 2 — **Vision AI 도입** (검증 후 결정)

- GPT-4o Vision으로 강아지 사진 분석
- 추정 mix 견종 (예: "푸들 + 말티즈") + 4축 score 자동 추출
- **비용**: 사진 1장 ~₩50~100, 전체 batch 1회 ~₩75~150만
- 사용자 사비 부담 OK 했지만 **MVP 검증 후 결정**이 안전 (먼저 demand 확인)

#### Phase 3 — **자체 ML 모델** (장기, 데이터 누적 후)

- 입양 follow-up 데이터 누적 → 믹스견 4축 score 추정 모델 학습
- Vision AI 대체 (비용 ↓)

### Plan C — 한국 견종 직접 입력 (2~3일)

- 진돗개·풍산개·삽살개·동경이·도사·삽살개 등 10~20개
- source: 한국애견협회 견종 표준 + AKC FSS (Jindo) + 우리 calibration
- 본인 강아지 경험·Keeper user 검증

### Plan D — Keeper kindCd list 받기 (사용자 input)

- Keeper 운영자가 가진 견종 코드 list 공유
- 10~20줄 sample만 있어도 GPT-4o로 전체 매핑 자동
- **이거 없으면 매핑 work 시작 X**

---

## 4-B. 견종 우선순위 (한국 reality 기반)

### Tier 1 — 즉시 매핑 (AKC 데이터 직접 사용)

**소형**: 푸들·말티즈·시추·포메·요크셔·치와와·비숑
**중형**: 시바·웰시코기·비글
**대형**: 골든리트리버·라브라도·말라뮤트·시베리안 허스키
→ AKC dog_traits_AKC에 다 있음

### Tier 2 — 우리 직접 입력 (한국 견종)

**한국 토종**: 진돗개·풍산개·삽살개·동경이·도사
→ 우리 calibration + 한국애견협회 자료

### Tier 3 — Phase 1 단순 처리, Phase 2 Vision AI

**믹스견** (한국 보호소 60%+)
→ Phase 1: 체중·크기·specialMark 기반 rule
→ Phase 2: Vision AI (검증 후)

### 결론

**MVP (Phase 1)**: Tier 1·2 (순종 30~50종) + Tier 3 단순 처리
**Phase 2**: Vision AI 도입 결정 (demand 검증 후)

---

## 5. 사용자 flow

```
[메인] "나와 잘 맞는 강아지는?"
   ↓
[Quiz Q1~Q5: 라이프스타일] 1분
   ↓
[Quiz Q6~Q10: 성격] 1분
   ↓
[Quiz Q11~Q15: 강아지 선호] 1분
   ↓
[MBTI optional] 15초
   ↓
[로딩: AI가 분석 중...] 2~3초
   ↓
[결과 화면 — viral 핵심]
   ┌─────────────────────────┐
   │ 당신은 시바견 type! 🐕   │
   │                         │
   │  [시바견 일러스트]       │
   │                         │
   │ 매칭 92%                │
   │ ✓ 독립적·자기 주관 강함 │
   │ ✓ INTP 성격에 fit       │
   │                         │
   │ [공유하기 카톡·인스타]  │
   └─────────────────────────┘
   ↓
[Keeper funnel CTA]
   "혹시 진짜 입양 고민?
    지금 시바견 type 유기견 3마리가
    Keeper에서 기다리고 있어요"
   [Keeper 보기 →]
```

---

## 6. Viral 요소 (5 핵심)

| 요소            | 우리 적용                                         |
| --------------- | ------------------------------------------------- |
| **0 진입장벽**  | 무료·로그인 X·즉시 시작                           |
| **짧음**        | 3분 30초                                          |
| **결과 공감**   | "이거 진짜 나야" — 깊은 4축 매칭 + MBTI           |
| **share 친화**  | OG image 강력 (견종 일러스트 + MBTI + 매칭 score) |
| **트렌드 흐름** | 펫 인플 시드 + 시즌 (구정·반려동물의 날)          |

### OG image 디자인

```
┌─────────────────────────────┐
│  [견종 일러스트 — 시바견]    │
│                             │
│  나는 시바견 type!          │
│  INTP × 시바견 = 92% 매칭   │
│                             │
│  ─────────────────────────  │
│  견종 매칭 quiz · 무료      │
│  pet-match.kr               │
└─────────────────────────────┘
```

---

## 7. Keeper Funnel 결과 측정

| Funnel 단계               | KPI                        |
| ------------------------- | -------------------------- |
| Quiz 시작                 | DAU                        |
| Quiz 완주                 | 완주율 (목표 70%+)         |
| 결과 share                | share rate (목표 20%+)     |
| Keeper CTA 클릭           | conversion (목표 10%+)     |
| **Keeper 가입**           | **최종 funnel** (목표 5%+) |
| Keeper에서 진지 매칭 quiz | 추가 conversion            |

→ Keeper user 100명 모으는 게 Quiz 1,000~2,000명 = viral 작은 폭발도 효과

---

## 8. 진지 매칭 Quiz와의 관계 (보완)

| 단계         | Quiz 종류                                             | Target                   |
| ------------ | ----------------------------------------------------- | ------------------------ |
| **Funnel 1** | **이 viral entertainment quiz**                       | 일반 시민 (입양 안 생각) |
| **Funnel 2** | Keeper 앱 안 진지 매칭 quiz (`adoption-quiz-spec.md`) | Keeper user (입양 결심)  |

```
[일반 시민]
  → [viral quiz] "나는 시바견 type!" share
  → [Keeper 인지]
  → [Keeper 가입]
  → [Keeper 안 진지 매칭 quiz] 실제 유기견 매칭
  → [입양]
```

---

## 9. Roadmap

### Phase 1 — Quiz MVP (1~2주)

- 데이터 수집 (dog_traits_AKC clone)
- 견종 30~50개 한국어 번역 (GPT-4o)
- 15문항 quiz 페이지 (Next.js)
- 매칭 알고리즘 v0
- 결과 화면 (텍스트 + 견종 사진)

### Phase 2 — Viral 강화 (1~2주)

- OG image 자동 생성 (Next.js opengraph-image)
- 견종별 일러스트 (Stable Diffusion or 일러스트 의뢰)
- 카톡·인스타 share 버튼
- MBTI optional 단계 추가
- Keeper funnel CTA 강화

### Phase 3 — Launching + 시드 (2~4주)

- 도메인 (pet-match.kr 등)
- 본인 SNS share
- 펫 인플루언서 5~10명 contact
- 시즌 (구정·반려동물의 날) 타기
- viral 폭발 or 정체 측정

### Phase 4 — 데이터·개선 (지속)

- 결과별 share rate 분석
- MBTI 입력률·정확도 측정
- Keeper funnel conversion 측정
- 견종 추가·번역 quality 개선

---

## 10. 기술 스택

- **Frontend**: Next.js 15 + Tailwind + shadcn/ui (온스케줄·Keeper 공통 stack)
- **DB**: Supabase (응답 저장 + 익명 통계)
- **OG image**: Next.js dynamic opengraph-image (온스케줄에서 검증)
- **AI 결과 설명**: OpenAI GPT-4o (선택, 비용 작음)
- **호스팅**: Vercel
- **분석**: Vercel Analytics + Plausible (privacy-friendly)

---

## 11. 비용 (사이드 부담)

| 항목                     | 비용                                                  |
| ------------------------ | ----------------------------------------------------- |
| Vercel                   | 무료 tier                                             |
| Supabase                 | 무료 tier (월 50K row OK)                             |
| 도메인                   | 연 ₩15,000                                            |
| GPT-4o (결과 설명, 선택) | 사용자 1명당 ~₩50                                     |
| 견종 일러스트 30개       | 직접 그리기 or Stable Diffusion 무료 or 외주 ₩10~30만 |

→ **월 운영 ₩0~₩30,000 (사용자 폭발 시)**

---

## 12. Risk·완화

| risk                                        | 완화                                                                                                                                           |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 이미 강아지 MBTI 5~6개 있음                 | 차별 = 15문항 깊이 + MBTI + Keeper funnel + 운영자 brand                                                                                       |
| Viral 폭발 X (대부분 fail)                  | 시드 100명 → 1차 시도 후 retain·share rate 측정                                                                                                |
| Keeper conversion 낮음                      | CTA 카피·UX·시각 강화 + A/B 테스트                                                                                                             |
| 견종 데이터 한국어 번역 quality             | GPT-4o 자동 번역 + 본인 검수                                                                                                                   |
| MBTI ↔ 4축 매핑 정확도                      | 학술 base + 시드 user data 누적 후 조정                                                                                                        |
| **★ 믹스견 매칭 정확도** (한국 보호소 60%+) | Phase 1 = rule-based 단순 처리 (수용). Phase 2 Vision AI 도입은 demand 검증 후 결정. 단 mission 영역에서 가장 중요 — 단순 처리도 0보다 큰 가치 |
| **Keeper kindCd 매핑 시작 지연**            | 사용자 list 공유가 critical input. 받기 전 다른 work (UI·quiz 종이 prototype) 병행                                                             |
| 한국 견종 데이터 quality                    | 직접 입력 + 본인 강아지·Keeper user 경험 검증                                                                                                  |

---

## 13. 다음 step (즉시)

### 🔥 Critical input — 사용자에게 필요

- [ ] **Keeper kindCd list 공유** (10~20줄 sample만 있어도 GPT-4o로 전체 매핑 자동 가능)
  - 예시 format: `422 · 시추 · ...`

### 데이터 work

- [ ] dog_traits_AKC GitHub clone (`git clone https://github.com/kkakey/dog_traits_AKC`)
- [ ] akcdata GitHub clone (`git clone https://github.com/tmfilho/akcdata`)
- [ ] Keeper kindCd list 받은 후: GPT-4o batch 매핑 (1주, ~₩3,000)
- [ ] 한국 견종 (진돗개·풍산개·삽살개 등 10~20개) 직접 입력 (2~3일)
- [ ] 믹스견 Phase 1 처리: rule-based (체중·specialMark) — Phase 2 Vision AI는 검증 후 결정

### Quiz·UX

- [ ] 도메인 후보 (pet-match.kr · ddongbti.kr 등)
- [ ] 15문항 종이 prototype 본인 + 친구 5명 테스트
- [ ] MBTI ↔ 4축 매핑 table v0 (16 유형 다)
- [ ] 결과 화면 design (견종 일러스트·OG image)

### 빌드

- [ ] Phase 1 (1~2주): MVP + 순종 30~50종 + 믹스견 단순 처리
- [ ] Phase 2 (1~2주): Viral 강화 (OG image·share·MBTI)
- [ ] Phase 3 (검증 후): Vision AI 도입 결정
