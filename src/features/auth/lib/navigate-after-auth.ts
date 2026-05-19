import { Route, router } from 'expo-router';

// 로그인/회원가입 완료 후 navigation 공통 처리.
// (untabs)/(unauth) 그룹을 통째로 dismiss → 진입 직전 탭/페이지로 자연 복귀.
// canDismiss=false (deep link 직접 진입 등) 면 fallback 으로 target 으로 replace.
//
// dismissAll vs router.back:
//   - router.back 은 group navigator 경계에서 stack 정리가 불완전해 동일 페이지가 중복 push 되는 케이스가 있음.
//   - dismissAll 은 현재 stack navigator(예: untabs) 의 root 까지 모두 pop → 그 아래 tab navigator 의 활성 탭으로 자연 복귀.
export const navigateAfterAuth = (target: Route) => {
  if (router.canDismiss?.()) {
    router.dismissAll();
    return;
  }
  router.replace(target);
};
