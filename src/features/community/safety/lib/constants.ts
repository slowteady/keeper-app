import type { ReportReason } from '../model/use-report';

export const REPORT_REASONS: readonly { id: ReportReason; label: string }[] = [
  { id: 'SPAM', label: '스팸 · 광고' },
  { id: 'ABUSE', label: '욕설 · 폭력 · 혐오' },
  { id: 'FRAUD', label: '사기 · 사칭' },
  { id: 'ANIMAL_ABUSE', label: '동물 학대 · 유해 정보' },
  { id: 'PRIVACY', label: '개인정보 노출' },
  { id: 'MONETARY', label: '책임비 · 금전 요구' },
  { id: 'MISUSE', label: '판매 목적 · 사육 포기 의심' }
] as const;

export const CONTACT_SAFETY_NOTICE =
  'keeper는 입양에 관여하지 않으며, 책임은 게시자·입양자에게 있어요.\n책임비 등 금전을 요구받으면 신고해주세요.';
