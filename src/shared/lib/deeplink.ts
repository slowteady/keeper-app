import { logger } from './utils/handle-error';

const SHARE_TYPES = ['adopt', 'shelter', 'community', 'missing'] as const;
type ShareType = (typeof SHARE_TYPES)[number];

const isShareType = (value: string): value is ShareType => SHARE_TYPES.includes(value as ShareType);

export type DeeplinkEvent = {
  type: ShareType;
  id: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmContent: string | null;
  initial: boolean;
};

type DeeplinkListener = (event: DeeplinkEvent) => void;

let pendingEvent: DeeplinkEvent | null = null;
let listener: DeeplinkListener | null = null;

// redirectSystemPath 는 React 트리 밖 모듈 스코프에서 호출된다. 콜드 스타트 유입은 보관했다가 구독 시점에 넘긴다.
export const subscribeDeeplink = (onEvent: DeeplinkListener) => {
  listener = onEvent;

  if (pendingEvent) {
    const event = pendingEvent;
    pendingEvent = null;
    onEvent(event);
  }

  return () => {
    listener = null;
  };
};

const emitDeeplink = (event: DeeplinkEvent) => {
  if (listener) listener(event);
  else pendingEvent = event;
};

const extractUtm = (path: string): Pick<DeeplinkEvent, 'utmSource' | 'utmMedium' | 'utmContent'> => {
  try {
    const { searchParams } = new URL(path);
    return {
      utmSource: searchParams.get('utm_source'),
      utmMedium: searchParams.get('utm_medium'),
      utmContent: searchParams.get('utm_content')
    };
  } catch {
    return { utmSource: null, utmMedium: null, utmContent: null };
  }
};

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
  if (refType === 'favorite') return '/(untabs)/profile/like';
  if (refType === 'shelter-favorite') return '/(untabs)/profile/like?tab=shelter';
  if (!refType || !refId) return null;
  switch (refType) {
    case 'post':
    case 'comment':
      return `/(untabs)/community/${refId}`;
    case 'inquiry':
      return `/(untabs)/profile/inquiry/${refId}`;
    case 'adopt':
      return `/(untabs)/adopt/${refId}`;
    case 'shelter':
      return `/(untabs)/shelter/${refId}`;
    default:
      logger.error('[deeplink] unsupported refType', refType);
      return null;
  }
}

const toRouterPath = (path: string): string => {
  try {
    const url = new URL(path);
    const host = url.protocol === 'keeper:' ? url.host : '';
    const pathname = `${host ? `/${host}` : ''}${url.pathname}`;
    return `${pathname || '/'}${url.search}`;
  } catch {
    return path;
  }
};

export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  try {
    const [type, id] = extractSegments(path);
    if (id && isShareType(type)) {
      emitDeeplink({ type, id, ...extractUtm(path), initial });
      return `/(untabs)/${type}/${id}`;
    }
    return toRouterPath(path);
  } catch {
    return '/';
  }
}
