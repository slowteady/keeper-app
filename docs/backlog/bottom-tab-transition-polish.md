# 바텀탭 전환 애니메이션 폴리시

> 상태: 백로그 (릴리즈 후 UI 폴리시). 기능 영향 없음, 체감 품질 개선.

## 배경

- 현재 `src/app/(tabs)/_layout.tsx` = expo-router `Tabs` + 커스텀 `BottomNavigation` tabBar, 화면 전환은 `screenOptions={{ animation: 'fade' }}`만.
- 탭 전환과 탭바 active 표시에 **애니메이션 요소가 부족해 부자연스럽게** 보임. 탭을 눌러도 화면만 fade로 바뀌고, 탭바 아이콘/인디케이터 전환·press 피드백이 밋밋함.

## 개선 방향 (착수 시 BP 딥리서치 + 현 `BottomNavigation` 구현 확인 후 확정)

- **화면 전환**: 단순 `fade` → 더 부드러운 전환 검토. 탭 인덱스 방향에 따른 미세 슬라이드/크로스페이드 등. expo-router(react-navigation) 옵션 vs reanimated 커스텀 트레이드오프 조사.
- **탭바 active 전환**: active 아이콘 색/스케일 transition, 인디케이터(밑줄·pill 배경) **위치 이동 애니메이션**(`withTiming`/`withSpring`), 비활성↔활성 보간.
- **press 피드백**: 탭 탭 시 스케일 다운/햅틱(`expo-haptics`) 등 즉각 반응.
- **라이브러리 검토**: react-navigation 기본 트랜지션으로 충분한지, reanimated layout/shared transition이 필요한지 비교.

## 작업(예정)

`BottomNavigation` 인디케이터·아이콘 전환 reanimated 적용 + 탭 화면 전환 옵션 튜닝 + press 피드백. 착수 전 레퍼런스 앱(전환 자연스러운 탭바) 패턴 조사.
