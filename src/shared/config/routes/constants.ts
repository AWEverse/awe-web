export const RELATIVE_ROUTE = {
  ID: ':id',
  USERNAME: ':username',
} as const;

export const ROUTES = {
  MAIN: '/',

  USER_PROFILE: {
    BASE: RELATIVE_ROUTE.USERNAME,
    FOLLOWERS: `/${RELATIVE_ROUTE.USERNAME}/followers`,
    FOLLOWING: `/${RELATIVE_ROUTE.USERNAME}/following`,
  } as const,

  CHAT: {
    BASE: '/chat',
    THREAD: `/chat/${RELATIVE_ROUTE.ID}`,
    NEW: '/chat/new',
    SEARCH: '/chat/search',
  } as const,

  DIALOGS: {
    BASE: '/dialogs',
    THREAD: `/dialogs/${RELATIVE_ROUTE.ID}`,
  } as const,

  DISCUSSION: {
    BASE: '/discussion',
    THREAD: `/discussion/${RELATIVE_ROUTE.ID}`,
  } as const,

  REELS: {
    BASE: '/reels',
    THREAD: `/reels/${RELATIVE_ROUTE.ID}`,
  } as const,

  VIDEO: {
    BASE: '/video',
    THREAD_ID: `/video/${RELATIVE_ROUTE.ID}`,
  } as const,

  MISC: {
    TEST: '/test',
    NOT_FOUND: '*', // 404 Not Found page
  } as const,
} as const;
