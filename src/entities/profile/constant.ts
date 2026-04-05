export const PROFILE_OPTIONS = {
  TAB: [
    { key: 'like', title: '관심' },
    { key: 'activity', title: '내활동' },
    { key: 'notice', title: '공지사항' }
  ],
  LIKE: [
    { id: 'adopt', label: '공고' },
    { id: 'shelter', label: '보호소' },
    { id: 'post', label: '게시글' },
    { id: 'etc', label: '기타' }
  ] as const
};

export type ProfileLikeOption = (typeof PROFILE_OPTIONS.LIKE)[number]['id'];
