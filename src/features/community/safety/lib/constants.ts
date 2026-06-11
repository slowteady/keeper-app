import type { ReportReason } from '../model/use-report';

export const REPORT_REASONS: readonly { id: ReportReason; label: string }[] = [
  { id: 'SPAM', label: '스팸 · 광고' },
  { id: 'ABUSE', label: '욕설 · 폭력 · 혐오' },
  { id: 'FRAUD', label: '사기 · 사칭' },
  { id: 'ANIMAL_ABUSE', label: '동물 학대 · 유해 정보' },
  { id: 'PRIVACY', label: '개인정보 노출' }
] as const;

export const ADOPT_DISCLAIMER =
  'keeper는 입양을 잇는 공간이에요.\n입양은 당사자끼리 직접 진행하고, keeper는 관여하지 않아요.\n입양 과정에서 생긴 문제의 책임은 게시자와 입양자에게 있어요.';

export const CONTACT_MONEY_WARNING =
  '책임비 등 금전을 요구받으면 신고해주세요.\nkeeper는 금전을 주고받는 입양을 금지해요.';
