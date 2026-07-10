const SCHEME_RE = /^[a-z][a-z\d+.-]*:/i;

export const toFileUri = (path: string): string => (SCHEME_RE.test(path) ? path : `file://${path}`);
