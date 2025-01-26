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

// Loading fallback component
const LoadingFallback = () => <div>Loading...</div>;

const { HOME, MAIN, USER_PROFILE, CHAT, DIALOGS, DISCUS, VIDEO } = ROUTES;

interface RouteConfig {
  path: string;
  element: React.ReactNode;
  nestedRoutes?: RouteConfig[];
}

const renderRouteElements = (routes: RouteConfig[]): JSX.Element[] =>
  routes.map(({ path, element }) => (
    <Route key={path} element={element} path={path} />
  ));

const HOME_ROUTES = [
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

const renderRoutes = () => (
  <>
    {renderRouteElements([
      { path: CHAT.BASE, element: <ChatPage /> },
      { path: "test", element: <TestPage /> },
      { path: "*", element: <NotFoundPage /> },
    ])}
    <Route element={<LayoutOutlet />} path={HOME.BASE}>
      {renderRouteElements(HOME_ROUTES)}
      {HOME_ROUTES.filter((route) => route.nestedRoutes).map(
        ({ path, element, nestedRoutes }) => (
          <Route key={path} element={element} path={path}>
            {nestedRoutes && renderRouteElements(nestedRoutes)}
          </Route>
        ),
      )}
    </Route>
  </>
);

export const AWERoutesBrowserRouter = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>{renderRoutes()}</Routes>
    </Suspense>
  );
};
