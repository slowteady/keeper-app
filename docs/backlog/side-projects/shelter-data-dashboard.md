# 한국 유기동물 데이터 Dashboard

> 작성일: 2026-05-24
> 상태: 기획 — 사이드프로젝트, OSS 형태 추천
> 우선순위: 1순위 (1인 sustainable + mission 임팩트 큼 + 재정 부담 0)

---

## 1. Vision

**한 줄**: 한국 유기동물 데이터를 누구나 본다.

### 풀고 싶은 문제

정부 데이터(국가동물보호정보시스템·서울 열린데이터·각 지자체) **이미 다 공개**되어 있는데:

- ❌ **정보 비대칭** — 시민·언론·연구자·기부자가 못 찾음
- ❌ **시각화 X** — raw 데이터 형태, 일반인 못 읽음
- ❌ **트렌드 X** — 시계열·지역 비교·계절성 분석 X
- ❌ **개별 보호소 정보 X** — 어디가 좋고 나쁜지 비교 X

해외엔 [Shelter Animals Count](https://www.shelteranimalscount.org/) + [Maddie's Fund](https://www.maddiesfund.org/shelter-and-rescue-data.htm) 같은 dashboard가 10년+ 운영 중. **한국 등가물 X**.

소프트웨어로 해결 가능: **공공데이터를 fetch → 시각화·분석 → 누구나 본다**.

---

## 2. Target user

| 우선순위 | user                                   | 사용 동기                          |
| -------- | -------------------------------------- | ---------------------------------- |
| 1차      | **언론**                               | 기사 쓸 때 통계 source, 인용       |
| 1차      | **연구자**                             | 동물복지·정책 연구 데이터          |
| 2차      | **기부자**                             | 어느 단체·보호소가 효율적인지 판단 |
| 2차      | **정책 담당자** (국회·지자체·중앙부처) | 정책 결정 근거                     |
| 3차      | **동물보호단체**                       | 본인·다른 단체 통계 비교           |
| 3차      | **일반 시민**                          | "우리 동네 reality" 보기           |
| 4차      | **Keeper user**                        | 보호소·구조단체 선택 시 참고       |

---

## 3. 핵심 기능

### 3.1 전국 dashboard (메인)

**한 화면에 전국 reality**:

- 올해 구조·입양·안락사·자연사·반환 마릿수 (현재)
- 전년 동기 대비 증감 (%)
- 일·주·월·연 트렌드 차트
- 견종·연령·크기 분포 (도넛·바)
- 지역별 heatmap (시도 단위, 색이 진할수록 많음)
- 핵심 KPI 4개 (구조·입양·안락사·반환)

### 3.2 지역별 deep dive (drill-down)

```
전국 → 시도 (17개) → 시군구 → 개별 보호소
```

- 각 단계: 통계·트렌드·점유율
- **좋은 보호소 vs 나쁜 보호소 비교**: 입양율 vs 안락사율 ranking
- **인구·반려인구 대비 유기율** = 정상화된 비교
- **시군구 비교**: 우리 동네 vs 인근 동네

### 3.3 시간 트렌드 (10년)

[Shelter Animals Count 모델](https://www.shelteranimalscount.org/) — 10년 트렌드 분석

- 정책 변경 전후 비교 (예: 동물등록제 강화 전/후)
- **계절성**: 여름·휴가철 유기 ↑·겨울 입양 ↓ 등
- 코로나 전·후 변화

### 3.4 개별 보호소 page

각 보호소마다 dedicated URL:

```
/shelter/[보호소 id]
```

- 메타: 위치·전화·운영기관·민간/공공·설립일
- 통계: 입양율·안락사율 history (연도별 추이)
- 현재 보호중 동물 수
- **잘하는 점·개선해야 할 점** (데이터 기반)
- 후원·자원봉사 link

### 3.5 API·오픈데이터 export

- JSON·CSV 다운로드 (연구자·언론용)
- **GitHub public repo** — 데이터·코드 다 오픈
- 매주 자동 업데이트 → ETL 결과 commit
- 연구자가 fork·연구·인용

### 3.6 알림 구독

- 특정 보호소·지역·트렌드 변동 시 이메일
- "우리 지역 안락사율 급증 알림"
- "올해 입양 1만 돌파" 같은 milestone 알림
- 언론·연구자에 매월 데이터 brief

---

## 4. 데이터 source (전부 무료 공공데이터)

| Source                                                                                | 데이터                    | API     |
| ------------------------------------------------------------------------------------- | ------------------------- | ------- |
| **[국가동물보호정보시스템 OpenAPI](https://www.data.go.kr/data/15098931/openapi.do)** | 구조동물 조회 (전국)      | ✅ 무료 |
| **[서울 열린데이터광장](https://data.seoul.go.kr/dataList/369/S/2/datasetView.do)**   | 자치구별 입양·안락사·폐사 | ✅ 무료 |
| **농림축산식품부 공공데이터**                                                         | 정책·실태조사             | ✅ 무료 |
| **각 지자체 공개 데이터**                                                             | 지자체별 통계             | 일부    |
| **[Shelter Animals Count](https://www.shelteranimalscount.org/)**                     | 글로벌 reference 비교     | 일부    |

### ETL pipeline

```
[공공데이터 API]
    │ (Vercel Cron, 매주 일요일 03:00)
    ▼
[fetch·정제·표준화]
    │
    ▼
[PostgreSQL (Supabase)]
    │
    ▼
[GitHub commit (오픈데이터 archive)]
    │
    ▼
[Next.js dashboard]
```

---

## 5. 기술 스택

| 영역            | 기술                                      |
| --------------- | ----------------------------------------- |
| **Frontend**    | Next.js 15 + Tailwind + shadcn/ui         |
| **시각화**      | Recharts (간단) or Visx / D3.js (정교)    |
| **지도**        | 카카오맵 API 또는 Mapbox                  |
| **DB**          | Supabase (PostgreSQL — 시계열 데이터 fit) |
| **ETL**         | Vercel Cron + Next.js API routes          |
| **자동 brief**  | OpenAI GPT-4o (월간 trend 요약 자연어)    |
| **호스팅**      | Vercel                                    |
| **데이터 오픈** | GitHub Actions + 자동 commit              |

→ **온스케줄과 동일 stack** = 인프라·디자인 시스템 reuse

---

## 6. Reference 모델

### [Shelter Animals Count](https://www.shelteranimalscount.org/)

- 미국 ASPCA 자회사 운영
- 2016~ 10년+ 데이터
- National Animal Welfare Statistics Dashboard + State-Level Dashboard
- 매년 mid-year + annual report 발행
- 언론·정책·연구자에 표준 source

### [Maddie's Fund](https://www.maddiesfund.org/shelter-and-rescue-data.htm)

- 펫 funding·연구 재단
- 오픈 데이터 발행
- 표준 데이터 matrix 정의
- Shelter Animals Count와 협력

### 우리 모델 차용

- **데이터 표준화** (Maddie's 정의 참고)
- **시각화 best practice** (Shelter Animals Count style)
- **단 한국 reality** (작은 시장, 1인 운영 → 단순화)

---

## 7. 운영 부담 (1인 sustainable 평가)

| 항목                  | 부담                                                   |
| --------------------- | ------------------------------------------------------ |
| **데이터 업데이트**   | Vercel Cron 자동, **manual 0**                         |
| **검증**              | 월 1~2시간 manual 체크 (데이터 변동·이상치)            |
| **콘텐츠**            | 월 1회 "이번 달 trend brief" 블로그 (선택, 30분~1시간) |
| **사용자 대응**       | 초기엔 거의 0, 인기 끌면 이메일·DM 응답                |
| **인프라 비용**       | Vercel 무료 / Supabase 무료 tier → **재정 부담 0**     |
| **OpenAI brief 생성** | 월 $1~5 (한 달 1회 brief)                              |

→ **운영 부담 = 월 3~5시간**. 1인 sustainable, baseline (온스케줄) 작업 방해 X.

---

## 8. 사회적 임팩트 path

### 8.1 언론 활용

- 매년 "한국 유기동물 reality" 보고서 발행
- 데이터 시각화 = 언론 자연 인용 (그래프·표 자료)
- 기자·논설위원 contact → 본인 brand·data trust 누적

### 8.2 정책 영향

- 국회 의원실·지자체·중앙부처에 데이터 제출
- 정책 결정 근거로 활용 가능 (예: 동물등록제·안락사 정책)
- 학회·세미나 발표

### 8.3 기부자 의사결정 도움

- "어느 단체가 효율적인가"
- 단체별·보호소별 비교 = 기부 전환 ↑
- 동물보호단체에 보면 우리 dashboard 자연 인용

### 8.4 연구자 협력

- 동물복지 학자에게 데이터 free 제공
- 논문 인용 → 학술 source 자리

### 8.5 일반 시민 인식

- "우리 지역 안락사 ~%" — 충격적 통계로 인식 확장
- SNS share 가능한 시각 콘텐츠

---

## 9. 수익 model (mission product = 무료 유지)

### 무료 OSS 유지가 brand·trust 핵심

- 정부 데이터 = 누구 것 X. 공익 활용이 정당
- 무료·오픈 = 언론·연구자·정책 사용 자유 → 인용·인지도 ↑

### 잠재 (검증 후, 본인 본격화 시)

- **후원·기부** (Patreon·토스 후원·동물 기부 펀드)
- **언론·연구자 sponsor** (특정 보고서·연구 후원)
- **데이터 컨설팅** (동물보호단체·정책 자문)

→ **수익화 비추** (초기). 무료 OSS로 brand·data trust 누적 = 향후 vertical specialist 자리 가장 강함.

---

## 10. 검증 path

### Phase 1 — MVP (1~2주)

- 국가동물보호정보시스템 OpenAPI 연동
- **전국 통계 1 페이지** (구조·입양·안락사 마릿수 + 시도별 차트)
- Vercel 배포

### Phase 2 — Drill-down (2~4주)

- 시도 → 시군구 → 보호소 drill-down
- 시간 트렌드 (월·연)
- 견종·연령·크기 분포

### Phase 3 — 개별 보호소 page (2~3개월)

- 보호소별 dedicated URL
- 입양율·안락사율 history
- 후원·자원봉사 link

### Phase 4 — Brand 누적 (6개월~)

- API export + 월간 brief + 연 보고서
- 언론 contact → 첫 인용
- 정책 자료 제출

---

## 11. Risk·완화

| risk                         | 완화                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| **공공데이터 자체 오류**     | 우리 책임 X. 단 우리 분석에서 이상치 감지 가능 → 자동 flag                           |
| **공공데이터 API 변경·중단** | 정부 정책상 가능성 작음. fallback: 다른 source 결합                                  |
| **데이터 1년 늦음**          | 일부 데이터 X. 단 trend·history는 의미 있음                                          |
| **시각화 quality**           | 1인 dev 부담. Recharts·shadcn/ui 기본 컴포넌트로 시작 → 점진 개선                    |
| **인지도 누적 시간**         | launching 후 6개월~1년. 콘텐츠·언론 contact로 가속                                   |
| **유사 정부 dashboard 등장** | 정부 dashboard는 UX 약함 + 통합 X. 차별 가능. 최악 시 데이터 source로 자리 잡으면 OK |

---

## 12. Brand·운영

### 이름 후보

- **"펫데이터 KR"** / **"PetData.kr"** (data brand 명확)
- **"동물의 숫자"** (감성·mission)
- **"무지개 통계"** (감성, but 무거움)
- **"K-Shelter Data"** (영어 source)

### 운영 form

- **OSS GitHub repo + Vercel 배포**
- 데이터·코드·시각화 다 public
- contribution PR 받음

### 콘텐츠 marketing

- **월간 brief** (메일링 list)
- **연간 보고서** (PDF·블로그)
- **SNS share용 시각 콘텐츠** (Threads·X·인스타)
- **언론 보도자료** 형식

---

## 13. Keeper와 시너지

- Keeper 안에서 **"우리 지역 통계"** 노출 (사용자 인사이트)
- 보호소 page에서 Keeper의 해당 보호소 강아지 자동 표시
- Dashboard에서 입양 가능한 강아지 → Keeper로 link
- **Brand 통합**: "Keeper 운영자가 만든 데이터" → trust 자연 누적

---

## 14. 다음 step

- [ ] 국가동물보호정보시스템 OpenAPI 가입·테스트 (data.go.kr)
- [ ] 데이터 schema 설계 (시계열 fit)
- [ ] Recharts·Visx 시각화 PoC (1~2 차트 prototype)
- [ ] 도메인 이름 결정 + 도메인 등록 (예: petdata.kr)
- [ ] MVP 빌드 (1~2주, 전국 통계 1 페이지)
- [ ] 본인 SNS·동물보호단체에 share → 피드백
