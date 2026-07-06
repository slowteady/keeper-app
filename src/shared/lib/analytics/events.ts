export const ANALYTICS_EVENT = {
  login: 'login',
  signupCompleted: 'signup_completed',
  loginPromptShown: 'login_prompt_shown',
  adoptDetailViewed: 'adopt_detail_viewed',
  shelterContactClicked: 'shelter_contact_clicked',
  adoptFavorited: 'adopt_favorited',
  contentShared: 'content_shared',
  posterSaved: 'poster_saved',
  adoptFilterApplied: 'adopt_filter_applied',
  postCreated: 'post_created',
  commentCreated: 'comment_created',
  postLiked: 'post_liked',
  pushOpened: 'push_opened',
  pushReceived: 'push_received',
  deeplinkOpened: 'deeplink_opened'
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENT)[keyof typeof ANALYTICS_EVENT];
