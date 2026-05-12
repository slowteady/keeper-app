// shelter/abandonment 둘 다 동일 로직 — 도메인별 분리 유지 위해 재사용은 같은 폴더 안에서.
// 향후 generic util 로 격상 가능하지만 현재는 도메인별 격리가 의도 더 명확.
export { patchFavoritedCache } from '../../favorite-shelter/lib/patch-favorited-cache';
