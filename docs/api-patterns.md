# API 패턴

## Query/Mutation Options Factory

- entities/api.ts에 queryOptions/mutationOptions factory를 정의한다
- service 함수는 module-private, factory만 export
- queryKey는 계층적으로 구성: [...all(), 'list', params]

## 스키마 설계

- 요청 파라미터: Zod enum으로 엄격하게
- 응답 데이터: z.string()으로 느슨하게 (백엔드 응답 형식 변동 대비)
- nullable/optional은 백엔드 DTO + SQL 기준으로 결정 (프론트 코드 기준 금지)

## select

- 응답 unwrap: res.data.data 패턴 통일
- 원본 배열 mutation 금지 ([...data].sort())
- 데이터 변환(mapTo~)은 select가 아닌 features hook의 useMemo에서

## 에러 핸들링

- throwOnError: 5xx/네트워크 에러 → ErrorBoundary, 4xx → 컴포넌트
- MutationCache.onError: 개별 onError 없는 mutation만 Sentry 전송
- ErrorBoundary: 탭 라우트(홈으로) / 상세 라우트(뒤로가기) 분리

## Interceptor

- authApi에만 interceptor 적용
- 401: refresh token으로 갱신 → 실패 시 로그인 화면
- 네트워크 에러 시 토큰 유지 (삭제 금지)
- refresh 타임아웃 10초
- interceptor 중복 등록 방지 (eject 후 재등록)

## API 인스턴스

- publicApi: 인증 불필요
- authApi: 인증 필요 (interceptor)
- kakaoApi: 외부 API (별도 baseURL)
