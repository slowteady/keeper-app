import { logger } from './utils/handle-error';

const SHARE_TYPES = ['adopt', 'shelter', 'community', 'missing'] as const;
type ShareType = (typeof SHARE_TYPES)[number];

const isShareType = (value: string): value is ShareType => SHARE_TYPES.includes(value as ShareType);

const extractSegments = (path: string): string[] => {
  let pathname = path;
  try {
    const url = new URL(path);
    pathname = url.protocol === 'keeper:' ? `${url.host}/${url.pathname}` : url.pathname;
  } catch {
    pathname = path;
  }
  return pathname
    .replace(/^\/?(share\/?)?/, '')
    .split('/')
    .filter(Boolean);
};

export function resolveNotificationPath(
  refType: string | null | undefined,
  refId: string | null | undefined,
  type?: string | null
): string | null {
  if (type === 'CONTENT_BLINDED') return '/(untabs)/profile/inquiry/new';
  if (!refType || !refId) return null;
  switch (refType) {
    case 'post':
    case 'comment':
      return `/(untabs)/community/${refId}`;
    case 'inquiry':
      return `/(untabs)/profile/inquiry/${refId}`;
    default:
      logger.error('[deeplink] unsupported refType', refType);
      return null;
  }
}

export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    const [type, id] = extractSegments(path);
    if (id && isShareType(type)) {
      return `/(untabs)/${type}/${id}`;
    }
    return path;
  } catch {
    return '/';
  }
}
