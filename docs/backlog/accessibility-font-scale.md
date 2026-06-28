# 접근성 — 시스템 글꼴 크기(Dynamic Type / Font Scale) 대응

> 상태: 백로그 (작업 순서 나중). 당장 깨지는 건 아니나, 글꼴 크게 키운 사용자에서 고정높이 카드 잘림.

## 문제

iOS Dynamic Type / Android Font Scale 로 사용자가 시스템 글꼴을 키우면:

- tamagui Text 가 RN Text 에 위임 → **확대는 이미 자동으로 됨** (`allowFontScaling` 기본 true)
- 단 **상한(`maxFontSizeMultiplier`)이 없어 무한 확대** → 고정높이(`minH`/`height`) + `numberOfLines` 쓴 카드/칩/버튼에서 **글자 잘림**

## 조사 결론 (딥다이브 완료)

### tamagui Text 동작 (소스 레벨 확인, tamagui 1.144.4)

- tamagui `Text` 는 RN `Text` 위에 빌드 → `allowFontScaling`/`maxFontSizeMultiplier` **순수 pass-through** (가로채지도 막지도 않음). grep 결과 tamagui 전체에 해당 prop 참조 0건.
- **확대는 자동, 상한은 개발자가 명시해야 함.**
- 전역 한 줄 불가: config `settings` 에 폰트스케일 옵션 없음. config `defaultProps.Text` 는 base Text 만 + **deprecated** + `styled`/`SizableText` 파생 미상속.
- keeper 는 `styled(Text)` 95개 산발 (RN Text 직접 import 는 0).
- fontSize 숫자 토큰은 고정 px + RN native 스케일 곱연산 (충돌 아님). `"1rem"` 문자열만 JS 레벨 사전 스케일 → 이중적용 위험 (keeper 는 숫자 토큰만 써서 해당 없음).

### 산업 표준 (Apple HIG / WCAG / Android / 실제 앱)

- **"제한(cap) 두고 대응"이 표준. 단 상한선 ≥ 200%(2.0x)** 이어야 위반 아님.
- Apple/WCAG/Android 모두 **200% 가 기준선**. AX5(~310%) 완전 지원은 아무도 강제 안 함 (Apple 본인도 안 함).
- **차단(`allowFontScaling=false`) 금지.** cap 은 허용. **단 200% 미만(특히 1.3x 전역)은 접근성 위반 비판 대상.** 1.2 미만 유해.
- 실무 정석 = **요소별 차등**:
  - 본문/콘텐츠: **2.0x**
  - 헤딩/버튼/라벨: 1.3~1.5x
  - 탭바/하단 네비: 고정 (Apple 공식 패턴 — Large Content Viewer 로 보완)

## 작업 계획 (나중)

1. 공용 `AppText` 생성:
   ```ts
   const AppText = styled(Text, {
     name: 'AppText',
     defaultProps: { maxFontSizeMultiplier: 2.0 } // allowFontScaling 기본 true 유지
   });
   ```
2. 기존 `styled(Text, ...)` 95곳 → `styled(AppText, ...)` 치환 (기계적). JSX `<Text>` 직접 사용처 → `<AppText>`.
3. **검증 변수**: `styled(AppText, ...)` 치환 시 AppText 의 `defaultProps` 가 chain 으로 상속되는지 적용 시 1개 확인. 상속되면 base 치환만으로 끝, 안 되면 각 styled 에 defaultProps 개별.
4. 큰 글꼴 QA (시뮬 글꼴 최대) → 그래도 깨지는 카드/버튼만 개별 cap 1.3~1.5 로 낮춤.
5. 탭바/네비는 고정 유지.
6. tsc/jest/eslint + 실기기 검증 (RN 0.81.5 에서 `maxFontSizeMultiplier` 정상 동작 확인 — RN 0.76 회귀 이슈 expo#32900 영향권 아닌지).

## 비용

- baseline(전역 2.0)은 **기계적 치환이라 반나절 안쪽**. baseline 만으로 산업 표준 충족.
- baseline 깔면 무한확대 막혀 깨지는 곳 급감 → QA 개별 수정 소수.

## 환경

- expo ~54.0.33 / react-native 0.81.5 / tamagui 1.144.4
- keeper fontSize 는 숫자 토큰 (`size: {1:12, 2:14, ...}`)

## 출처

- Apple Larger Text criteria, W3C WCAG 1.4.4, Android 14 nonlinear font scaling, RN Text 문서, tamagui configuration/styled 소스, RN issue #47499 / expo#32900
