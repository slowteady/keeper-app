# 기획 변경 사항

## 1. 입양공고 마감임박 칩 문구 변경

**화면**: 홈 > 입양공고 섹션, 입양공고 목록, 보호소 상세 > 입양공고 목록

**이유**: 공공데이터 API에서 제공하는 건 공고 종료일뿐이고, 공고 마감이 안락사를 의미하지 않음. 보호소마다 이후 처리가 다르기 때문에 사실과 다른 표현은 신뢰도 문제가 될 수 있음.

**AS-IS**: `안락사 위기` (error 칩)

**TO-BE**: `공고마감임박` (error 칩)

**수정 대상**:

- `src/entities/adopt/mapper.ts` — FILTER_CHIP_MAP.NEAR_DEADLINE.value
- `src/entities/adopt/mapper.test.ts` — 테스트 검증값
- **상태**: ✅ 완료

---

## 아이디어

### 1. D-day 칩 추가

**화면**: 홈 > 입양공고 섹션 카드, 입양공고 목록 카드

**설명**: 마감임박 필터일 때 공고 종료일까지 남은 일수를 칩으로 표시 (예: `D-3`, `D-1`). 현재 공고기간(시작~종료)만 표시되는데, 남은 일수가 있으면 긴급성이 더 직관적.

**적용 위치**: `src/entities/adopt/mapper.ts` — mapToAdoptList에서 noticeEndDt 기반으로 D-day 계산 후 칩 추가
