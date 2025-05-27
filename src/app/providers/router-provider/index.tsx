import { RouterFactory as RouterFactory } from "@/shared/router";
import { RouteConfig } from "@/shared/router/types";
import HomePage from "@/pages/home/ui/HomePage";
import LayoutOutlet from "@/widgets/layout-outlet";
import { SingleThread } from "@/pages/threds/";
import { ROUTES } from "./constants";

const { HOME, MAIN, USER_PROFILE, CHAT, DIALOGS, DISCUS, VIDEO } = ROUTES;

export const AWERoutesBrowserRouter = () => (
  <>
    <RouterFactory
      routes={
        [
          {
            path: HOME.BASE,
            element: <LayoutOutlet />,
            componentId: "layout",
            meta: {
              title: "AWE - Main Layout",
              priority: "high",
            },
            children: [
              {
                index: true,
                element: <HomePage />,
                componentId: "home",
                meta: {
                  title: "AWE - Home",
                  priority: "high",
                  preloadDistance: 0,
                },
              },
              {
                path: MAIN,
                lazy: () => import("@/pages/thread"),
                componentId: "thread",
                meta: {
                  title: "AWE - Threads",
                  priority: "high",
                },
              },
              {
                path: USER_PROFILE.BASE,
                lazy: () => import("@/pages/profile"),
                componentId: "profile",
                meta: {
                  title: "User Profile",
                  priority: "medium",
                },
              },
              {
                path: DIALOGS.THREAD,
                element: <SingleThread />,
                componentId: "single-thread",
                meta: {
                  title: "Dialog Thread",
                  priority: "medium",
                },
              },
              {
                path: DISCUS.BASE,
                lazy: () => import("@/pages/d"),
                componentId: "reddit",
                meta: {
                  title: "Discussions",
                  priority: "medium",
                },
                children: [
                  {
                    path: DISCUS.THREAD,
                    lazy: () => import("@/pages/d/subreddit"),
                    componentId: "subreddit",
                    meta: {
                      title: "Subreddit",
                      priority: "low",
                    },
                  },
                  {
                    path: DISCUS.OVERVIEW,
                    lazy: () => import("@/pages/d/subpages/overview"),
                    componentId: "overview",
                    meta: {
                      title: "Discussion Overview",
                      priority: "low",
                    },
                  },
                  {
                    path: DISCUS.DISSCUSIONS,
                    lazy: () => import("@/pages/d/subpages/disscusions"),
                    componentId: "discussions",
                    meta: {
                      title: "Discussions",
                      priority: "low",
                    },
                  },

                  {
                    path: DISCUS.MEMBERS,
                    lazy: () => import("@/pages/d/subpages/people"),
                    componentId: "community-people",
                    meta: {
                      title: "Community Members",
                      priority: "low",
                    },
                  },
                ],
              },
              {
                path: DISCUS.SUBCATEGORIES,
                lazy: () => import("@/pages/d/subcategories/ui/SubCategory"),
                componentId: "subcategories",
                meta: {
                  title: "Subcategories",
                  priority: "low",
                },
              },
              {
                path: DIALOGS.BASE,
                lazy: () => import("@/pages/threds"),
                componentId: "threads",
                meta: {
                  title: "Dialogs",
                  priority: "medium",
                },
              },
              {
                path: VIDEO.BASE,
                lazy: () => import("@/pages/video"),
                componentId: "video",
                meta: {
                  title: "Videos",
                  priority: "medium",
                },
              },
              {
                path: VIDEO.THREAD,
                lazy: () => import("@/pages/threds"),
                componentId: "video-threads",
                meta: {
                  title: "Video Threads",
                  priority: "low",
                },
              },
              {
                path: VIDEO.THREAD_ID,
                element: <SingleThread />,
                componentId: "video-single-thread",
                meta: {
                  title: "Video Thread",
                  priority: "low",
                },
              },
            ],
          },
          {
            path: CHAT.BASE,
            lazy: () => import("@/pages/chat"),
            componentId: "chat",
            meta: {
              title: "Chat",
              priority: "medium",
            },
          },
          {
            path: "test",
            lazy: () => import("@/pages/test"),
            componentId: "test",
            meta: {
              title: "Test Page",
              priority: "low",
            },
          },
          {
            path: "*",
            lazy: () => import("@/pages/not-found"),
            componentId: "404",
            meta: {
              title: "Page Not Found",
              priority: "low",
            },
          },
        ] as RouteConfig[]
      }
      preloadAll={process.env.NODE_ENV === "production"}
      onRoutePreload={(loaded, total) => {
        console.debug(`Route preloading progress: ${loaded}/${total}`);
      }}
    />
  </>
);
