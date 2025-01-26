import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";

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

const renderRoutes = () => (
  <>
    <Route element={<ChatPage />} path={CHAT.BASE} />
    <Route element={<LayoutOutlet />} path={HOME.BASE}>
      <Route element={<HomePage />} path={HOME.BASE} />
      <Route element={<ThreadPage />} path={MAIN} />
      <Route element={<ProfilePage />} path={USER_PROFILE.BASE} />
      <Route element={<SingleThread />} path={DIALOGS.THREAD} />
      <Route element={<RedditPage />} path={DISCUS.BASE}>
        <Route element={<SubRedditPage />} path={DISCUS.THREAD} />
        <Route element={<OverviewPage />} path={DISCUS.OVERVIEW} />
        <Route element={<DisscusionsPage />} path={DISCUS.DISSCUSIONS} />
        <Route element={<CommunityPeoplePage />} path={DISCUS.MEMBERS} />
      </Route>
      <Route element={<ThreadsPage />} path={DIALOGS.BASE} />
      <Route element={<SingleThread />} path={DIALOGS.BASE} />
      <Route element={<VideoPage />} path={VIDEO.BASE} />
      <Route element={<ThreadsPage />} path={VIDEO.THREAD} />
      <Route element={<SingleThread />} path={VIDEO.THREAD_ID} />
    </Route>
    <Route element={<TestPage />} path="test" />
    <Route element={<NotFoundPage />} path="*" />
  </>
);

export const AWERoutesBrowserRouter = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>{renderRoutes()}</Routes>
    </Suspense>
  );
};
