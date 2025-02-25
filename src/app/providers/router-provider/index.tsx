import { createBrowserRouter, RouterProvider } from "react-router";
import { Suspense, lazy } from "react";

// Lazy-loaded pages
const TestPage = lazy(() => import("@/pages/test"));
const OverviewPage = lazy(() => import("@/pages/d/subpages/overview"));
const ThreadsPage = lazy(() => import("@/pages/threds"));
const DisscusionsPage = lazy(() => import("@/pages/d/subpages/disscusions"));
const CommunityPeoplePage = lazy(() => import("@/pages/d/subpages/people"));
const ChatPage = lazy(() => import("@/pages/chat"));
const ThreadPage = lazy(() => import("@/pages/thread"));
const NotFoundPage = lazy(() => import("@/pages/not-found"));
const RedditPage = lazy(() => import("@/pages/d"));
const SubRedditPage = lazy(() => import("@/pages/d/subreddit"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const VideoPage = lazy(() => import("@/pages/video"));

import { SingleThread } from "@/pages/threds/";
import { ROUTES } from "./constants";
import RouteFallback from "./ui/RouteFallback";
import HomePage from "@/pages/home/ui/HomePage";
import LayoutOutlet from "@/widgets/layout-outlet";

const { HOME, MAIN, USER_PROFILE, CHAT, DIALOGS, DISCUS, VIDEO } = ROUTES;

const router = createBrowserRouter([
  {
    path: HOME.BASE,
    element: <LayoutOutlet />,
    children: [
      { index: true, element: <HomePage /> },
      { path: MAIN, element: <ThreadPage /> },
      { path: USER_PROFILE.BASE, element: <ProfilePage /> },
      { path: DIALOGS.THREAD, element: <SingleThread /> },
      {
        path: DISCUS.BASE,
        element: <RedditPage />,
        children: [
          { path: DISCUS.THREAD, element: <SubRedditPage /> },
          { path: DISCUS.OVERVIEW, element: <OverviewPage /> },
          { path: DISCUS.DISSCUSIONS, element: <DisscusionsPage /> },
          { path: DISCUS.MEMBERS, element: <CommunityPeoplePage /> },
        ],
      },
      { path: DIALOGS.BASE, element: <ThreadsPage /> },
      { path: VIDEO.BASE, element: <VideoPage /> },
      { path: VIDEO.THREAD, element: <ThreadsPage /> },
      { path: VIDEO.THREAD_ID, element: <SingleThread /> },
    ],
  },
  { path: CHAT.BASE, element: <ChatPage /> },
  { path: "test", element: <TestPage /> },
  { path: "*", element: <NotFoundPage /> },
]);

export const AWERoutesBrowserRouter = () => (
  <Suspense fallback={<RouteFallback />}>
    <RouterProvider router={router} />
  </Suspense>
);
