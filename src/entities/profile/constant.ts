export const PROFILE_OPTIONS = {
  TAB: [
    { key: 'like', title: '관심' },
    { key: 'activity', title: '내활동' },
    { key: 'notice', title: '공지사항' }
  ],
  LIKE: [
    { id: 'adopt', label: '공고' },
    { id: 'shelter', label: '보호소' }
  ] as const
};

export const PROFILE_LIKE_TAB_ROUTES = [
  { key: 'adopt', title: '공고' },
  { key: 'shelter', title: '보호소' }
] as const;

export type ProfileLikeOption = (typeof PROFILE_OPTIONS.LIKE)[number]['id'];
