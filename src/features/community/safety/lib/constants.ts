import type { ReportReason } from '../model/use-report';

export const REPORT_REASONS: readonly { id: ReportReason; label: string }[] = [
  { id: 'SPAM', label: '스팸 / 광고성 게시물' },
  { id: 'ABUSE', label: '욕설 / 비방' },
  { id: 'SEXUAL', label: '음란성 / 청소년 유해' },
  { id: 'COPYRIGHT', label: '저작권 침해 / 명예훼손' },
  { id: 'OTHER', label: '기타' }
] as const;
