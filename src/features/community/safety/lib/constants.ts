import type { ReportReason } from '../model/use-report';

export const REPORT_REASONS: readonly { id: ReportReason; label: string }[] = [
  { id: 'SPAM', label: '스팸 · 광고' },
  { id: 'ABUSE', label: '욕설 · 폭력 · 혐오' },
  { id: 'FRAUD', label: '사기 · 사칭' },
  { id: 'ANIMAL_ABUSE', label: '동물 학대 · 유해 정보' },
  { id: 'PRIVACY', label: '개인정보 노출' }
] as const;
