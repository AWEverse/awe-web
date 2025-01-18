// ### 1. **Main**
// - `/` — Main page

// ### 3. **User Profile**
// - `/:username` — User profile
// - `/:username/followers` — List of followers
// - `/:username/following` — List of following

// ### 4. **Dialogs (Messaging)**
// - `/dialogs` — Dialog thread
// - `/dialogs/:id` — Specific dialog thread

// ### 5. **Discussion**
// - `/disscus` — Discussion thread
// - `/disscus/:id` — Specific discussion thread

// ### 6. **Reels**
// - `/reels` — Reels thread
// - `/reels/:id` — Specific reel

// ### 7. **Video**
// - `/video` — Video overview
// - `/video/:id` — Specific video
// - `/video/thread` — Video thread

// ### 8. **Chat**
// - `/chat` — Chat overview
// - `/chat/:username` — Specific chat thread
// - `/chat/new` — Create new chat
// - `/chat/search` — Search in chats

// ### 9. **Miscellaneous**
// - `/test` — Test page
// - `*` — 404 Not Found page

export const ROUTES = {
  MAIN: "/",

  HOME: {
    BASE: "",
  },

  USER_PROFILE: {
    BASE: "/:username",
    FOLLOWERS: "/:username/followers",
    FOLLOWING: "/:username/following",
  },

  CHAT: {
    BASE: "/chat",
    THREAD: "/chat/:id",
    NEW: "/chat/new",
    SEARCH: "/chat/search",
  },

  DIALOGS: {
    BASE: "/dialogs",
    THREAD: "/dialogs/:id",
  },

  DISCUS: {
    BASE: "/d",
    THREAD: ":id",
    OVERVIEW: "overview",
    DISSCUSIONS: "disscusions",
    MEMBERS: "members",
  },

  REELS: {
    BASE: "/reels",
    THREAD: "/reels/:id",
  },

  VIDEO: {
    BASE: "/video",
    THREAD: "/video/thread",
    THREAD_ID: "/video/thread/:id",
  },
};
