import { Route, Routes } from "react-router-dom";
import { JSX, lazy, Suspense } from "react";

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

interface RouteConfig {
  path: string;
  element: React.ReactNode;
  nestedRoutes?: RouteConfig[];
}

// A recursive function to render routes including any nested routes
const renderRoutes = (routes: RouteConfig[]): JSX.Element[] =>
  routes.map(({ path, element, nestedRoutes }) => (
    <Route key={path} path={path} element={element}>
      {nestedRoutes && renderRoutes(nestedRoutes)}
    </Route>
  ));

// Define global (non-nested) routes
const globalRoutes: RouteConfig[] = [
  { path: CHAT.BASE, element: <ChatPage /> },
  { path: "test", element: <TestPage /> },
  { path: "*", element: <NotFoundPage /> },
];

// Define routes nested under the LayoutOutlet (for HOME.BASE)
const homeRoutes: RouteConfig[] = [
  { path: HOME.BASE, element: <HomePage /> },
  { path: MAIN, element: <ThreadPage /> },
  { path: USER_PROFILE.BASE, element: <ProfilePage /> },
  { path: DIALOGS.THREAD, element: <SingleThread /> },
  {
    path: DISCUS.BASE,
    element: <RedditPage />,
    nestedRoutes: [
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
];

export const AWERoutesBrowserRouter = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {renderRoutes(globalRoutes)}
        <Route element={<LayoutOutlet />} path={HOME.BASE}>
          {renderRoutes(homeRoutes)}
        </Route>
      </Routes>
    </Suspense>
  );
};
