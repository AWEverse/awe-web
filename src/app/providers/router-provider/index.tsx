import { RouterFactory } from "@/shared/router/core";
import { RouteConfig } from "@/shared/router/types";
import HomePage from "@/pages/home/ui/HomePage";
import LayoutOutlet from "@/widgets/layout-outlet";
import { SingleThread } from "@/pages/threds/";
import { ROUTES } from "./constants";

const { HOME, MAIN, USER_PROFILE, CHAT, DIALOGS, DISCUS, VIDEO } = ROUTES;

export const AWERoutesBrowserRouter = () => (
  <RouterFactory
    routes={
      [
        {
          path: HOME.BASE,
          element: <LayoutOutlet />,
          componentId: "layout",
          children: [
            {
              index: true,
              element: <HomePage />,
              componentId: "home",
            },
            {
              path: MAIN,
              lazy: () => import("@/pages/thread"),
              componentId: "thread",
            },
            {
              path: USER_PROFILE.BASE,
              lazy: () => import("@/pages/profile"),
              componentId: "profile",
            },
            {
              path: DIALOGS.THREAD,
              element: <SingleThread />,
              componentId: "single-thread",
            },
            {
              path: DISCUS.BASE,
              lazy: () => import("@/pages/d"),
              componentId: "reddit",
              children: [
                {
                  path: DISCUS.THREAD,
                  lazy: () => import("@/pages/d/subreddit"),
                  componentId: "subreddit",
                },
                {
                  path: DISCUS.OVERVIEW,
                  lazy: () => import("@/pages/d/subpages/overview"),
                  componentId: "overview",
                },
                {
                  path: DISCUS.DISSCUSIONS,
                  lazy: () => import("@/pages/d/subpages/disscusions"),
                  componentId: "discussions",
                },
                {
                  path: DISCUS.MEMBERS,
                  lazy: () => import("@/pages/d/subpages/people"),
                  componentId: "community-people",
                },
              ],
            },
            {
              path: DIALOGS.BASE,
              lazy: () => import("@/pages/threds"),
              componentId: "threads",
            },
            {
              path: VIDEO.BASE,
              lazy: () => import("@/pages/video"),
              componentId: "video",
            },
            {
              path: VIDEO.THREAD,
              lazy: () => import("@/pages/threds"),
              componentId: "video-threads",
            },
            {
              path: VIDEO.THREAD_ID,
              element: <SingleThread />,
              componentId: "video-single-thread",
            },
          ],
        },
        {
          path: CHAT.BASE,
          lazy: () => import("@/pages/chat"),
          componentId: "chat",
        },
        {
          path: "test",
          lazy: () => import("@/pages/test"),
          componentId: "test",
        },
        {
          path: "*",
          lazy: () => import("@/pages/not-found"),
          componentId: "404",
        },
      ] as RouteConfig[]
    }
    preloadAll={process.env.NODE_ENV === "production"}
    onRoutePreload={(loaded, total) => {
      console.debug(`Route preloading progress: ${loaded}/${total}`);
    }}
  />
);
