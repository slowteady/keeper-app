# AI 포스터/이미지 → 폼 자동채움

> 상태: 발산 완료(2026-06-30 갱신, 인프라 이동 완료·R2 전환 반영). 실종분실 기능의 차별화 후보 = Phase 1.5. 다음 /spec(실종 폼 확정 직후).
> 주의: 이 문서는 **역방향**(이미지→폼 자동채움). 정방향(데이터→완성 포스터 이미지·다운로드·인스타)은 [[05-poster-template-share]] — 별개 기능, 같은 클러스터.

## 배경 / 문제

실종신고는 긴급·감정적 상황이라 동물 정보·실종 일시·장소·연락처 등 폼을 여러 개 채우는 마찰이 등록을 막는다. 보호자/목격자가 병원·전봇대에 붙은 실종 전단지(포스터)를 **촬영·첨부하면 AI가 이미지를 읽어 폼을 자동으로 채워주는** 기능으로 진입장벽을 낮춘다.

## 기능 개요

1. 작성 폼에서 이미지 촬영/첨부
2. 백엔드가 이미지(R2 URL)를 Vision LLM 에 전달 → 구조화 JSON 추출
3. 추출값으로 폼 자동채움 (AI 채움 시각 구분)
4. 사용자 검수·수정
5. 제출

## 레퍼런스 BP (딥다이브 완료)

- **검증된 패턴**: 명함(CamCard), 영수증(SparkReceipt), 이력서(Workday), 신분증/KYC(Mitek). "추출 → 검수 → 제출" 흐름 표준화됨.
- **실종 도메인엔 빈자리**: PawBoost 등도 사진 첨부만 하고 폼은 수동 → keeper 차별화 포인트.
- **기술**: 비정형 전단지엔 **Vision LLM(GPT-4o-mini / Gemini 2.5 Flash) 우위** (필드 정확도 88~~90%). 전용 OCR/Document AI(AWS Textract, Google Document AI, CLOVA)는 비정형 자유포맷에 약하고(40~~78%) 고정비 발생 → 부적합.
- **UX 표준 (협상 불가)**: 자동제출 금지 / 검수 필수 / AI채움 시각 구분(아이콘·배경색) / 추출 실패 필드는 빈 채로 강조 / 기존 입력값 덮어쓰기 금지 / 신뢰도 낮은 필드 경고.
- **정확도**: 인쇄 전단지 88~90%, 한국어 손글씨 64% → 검수 전제면 실패해도 불만 작음.
- **비용**: GPT-4o-mini / Gemini Flash 기준 이미지 1장 ~수십원, 실종은 저빈도라 **월 $1 미만~수 달러**. 비영리 1인운영 부담 없음.
- **keeper 이식**: 이미지가 이미 R2 presigned PUT 으로 업로드됨 → NestJS 모듈 1개가 R2 URL 을 Vision LLM 에 전달 → structured JSON → 프론트 검수. 저복잡도.

## 왜 keeper 에 맞나

- 앞서 컷한 "AI 얼굴인식 매칭"(자체 모델 학습 + 인프라)과 달리 **외부 API 단일 호출 + 기존 R2 흐름 재활용** → 인프라 가벼움.
- 실종 등록 마찰을 크게 줄이는 차별화 기능이며 비용 부담이 작다.

## 컷한 옵션

- 전용 OCR/Document AI (AWS Textract Forms, Google Document AI, CLOVA OCR) — 비정형 전단지에 부적합 + 고정비. 오버엔지니어링.
- AI 얼굴인식 매칭 — 자체 모델/인프라 한계 초과 (별도 컷).
- 자동 제출 — 정확도 한계로 검수 없는 자동 제출은 신뢰 파괴. 절대 금지.

## 오픈 이슈 (TBD — 사용자 결정 대기)

- 범위: 실종 MVP 포함 vs Phase 1.5 (폼 확정 직후 얹기) — 잠정 Phase 1.5
- 소속: 실종 전용 vs 횡단(개인입양 폼 재활용) — 잠정 실종 특화 시작 + 범용 모듈 구현
- 모델 선택: GPT-4o-mini vs Gemini 2.5 Flash (한국어 정확도·비용 재비교)
- 추출 대상: 전단지 텍스트 OCR(이름/연락처/일시/장소) vs 동물 사진에서 종·색상 추정 — 범위 정의
- 저화질 사전 감지 + 재촬영 유도 여부

## 출처

- Mitek Data Pre-Fill (KYC), CamCard, SparkReceipt/Foreceipt, Workday Resume Parsing
- AWS Textract vs Google Document AI vs GPT-4o invoice benchmark (businesswaretech)
- Document Data Extraction: LLMs vs OCRs (Vellum), OCR Failure Rate (AIQ Labs)
- Gemini API Pricing, GPT-4o Vision Guide, Integrating OpenAI with NestJS (Paktolus)
