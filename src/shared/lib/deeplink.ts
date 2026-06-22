const SHARE_TYPES = ['adopt', 'shelter', 'community'] as const;
type ShareType = (typeof SHARE_TYPES)[number];

const isShareType = (value: string): value is ShareType => SHARE_TYPES.includes(value as ShareType);

const extractSegments = (path: string): string[] => {
  let pathname = path;
  try {
    const url = new URL(path);
    pathname = url.protocol === 'keeper:' ? `${url.host}/${url.pathname}` : url.pathname;
  } catch {
    // 상대 path — 그대로 사용
  }
  return pathname
    .replace(/^\/?(share\/?)?/, '')
    .split('/')
    .filter(Boolean);
};

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
