import { useRef, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { requestMeasure } from "@/lib/modules/fastdom";
import { partition } from "@/lib/utils/iteratees";
import { IS_IOS } from "@/lib/core";
import { useStableCallback } from "@/shared/hooks/base";

const SAFARI_EDGE_BACK_GESTURE_LIMIT = 300 * window.devicePixelRatio;
const SAFARI_EDGE_BACK_GESTURE_DURATION = 350;

const historyUniqueSessionId = Date.now();

interface HistoryRecord {
  index: number;
  shouldBeReplaced?: boolean;
  isClosed?: boolean;
  markReplaced?: () => void;
  onBack?: () => void;
  pathname: string; // Added for React Router path tracking
}

type HistoryOperation =
  | { type: "go"; delta: number }
  | {
    type: "pushState" | "replaceState";
    data: any;
    hash?: string;
    pathname: string;
  };

let historyState: HistoryRecord[] = [];
let historyCursor = 0;
let isAlteringHistory = false;
let deferredHistoryOperations: HistoryOperation[] = [];
let deferredPopstateOperations: HistoryOperation[] = [];
let isSafariGestureAnimation = false;

type NavigateFunctuion = ReturnType<typeof useNavigate>;

/**
 * Initializes history state to the root entry using React Router.
 * @param navigate - React Router's navigate function
 * @param pathname - Current route path
 */
const resetHistory = (
  navigate: NavigateFunctuion,
  pathname: string,
) => {
  historyCursor = 0;
  historyState = [{ index: 0, onBack: () => navigate(-1), pathname }];
  navigate(pathname, {
    replace: true,
    state: { index: 0, historyUniqueSessionId },
  });
};

/**
 * Processes deferred history operations with React Router navigation.
 */
const applyDeferredHistoryOperations = (
  navigate: NavigateFunctuion,
) => {
  const [goOps, stateOps] = partition(
    deferredHistoryOperations,
    (op) => op.type === "go",
  ) as [HistoryOperation[], HistoryOperation[]];
  deferredHistoryOperations = [];

  const netDelta = goOps.reduce(
    (sum, op) => sum + (op as { delta: number }).delta,
    0,
  );
  if (netDelta) {
    navigate(netDelta);
    if (stateOps.length) {
      deferredPopstateOperations.push(...stateOps);
      return;
    }
  }

  stateOps.forEach((op) => {
    const { type, data, hash, pathname } = op as {
      type: "pushState" | "replaceState";
      data: any;
      hash?: string;
      pathname: string;
    };
    navigate(`${pathname}${hash ? `#${hash}` : ""}`, {
      replace: type === "replaceState",
      state: data,
    });
  });
};

/**
 * Queues a history operation with RAF scheduling.
 */
const deferHistoryOperation = (
  operation: HistoryOperation,
  navigate: NavigateFunctuion,
) => {
  if (!deferredHistoryOperations.length) {
    requestMeasure(() => applyDeferredHistoryOperations(navigate));
  }
  deferredHistoryOperations.push(operation);
};

/**
 * Cleans up closed history records.
 */
const cleanupClosed = (
  navigate: NavigateFunctuion,
  initialClosedCount = 1,
): number => {
  let closedCount = initialClosedCount;
  for (let i = historyCursor - 1; i > 0; i--) {
    if (historyState[i]?.isClosed) closedCount++;
  }
  if (closedCount) {
    isAlteringHistory = true;
    deferHistoryOperation({ type: "go", delta: -closedCount }, navigate);
  }
  return closedCount;
};

/**
 * Resets trashed history states after invalid navigation.
 */
const cleanupTrashedState = (
  navigate: NavigateFunctuion,
  pathname: string,
) => {
  let isAnimationDisabled = false;
  for (let i = historyState.length - 1; i > 0; i--) {
    if (historyState[i].isClosed) continue;
    if (!isAnimationDisabled && isSafariGestureAnimation) {
      isAnimationDisabled = true;
    }
    historyState[i].onBack?.();
  }
  resetHistory(navigate, pathname);
};

if (IS_IOS) {
  const setupTouchListeners = () => {
    const gestureLimit = SAFARI_EDGE_BACK_GESTURE_LIMIT;
    const windowWidth = window.innerWidth;
    let animationTimeout: NodeJS.Timeout | null = null;

    const handleTouchStart = (event: TouchEvent) => {
      const x = event.touches[0].pageX;
      if (x <= gestureLimit || x >= windowWidth - gestureLimit) {
        isSafariGestureAnimation = true;
      }
    };

    const handleTouchEnd = () => {
      if (!isSafariGestureAnimation) return;
      if (animationTimeout) clearTimeout(animationTimeout);
      animationTimeout = setTimeout(() => {
        isSafariGestureAnimation = false;
        animationTimeout = null;
      }, SAFARI_EDGE_BACK_GESTURE_DURATION);
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("popstate", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("popstate", handleTouchEnd);
    };
  };

  setupTouchListeners();
}

interface UseHistoryBackProps {
  isActive?: boolean;
  shouldBeReplaced?: boolean;
  hash?: string;
  shouldResetUrlHash?: boolean;
  onBack: () => void;
}

/**
 * Custom hook to manage browser history with React Router v7 back navigation support.
 * @param {UseHistoryBackProps} props - Configuration for history behavior
 * @returns {void}
 */
export default function useHistoryBack({
  isActive = false,
  shouldBeReplaced = false,
  hash,
  shouldResetUrlHash = false,
  onBack,
}: UseHistoryBackProps): void {
  const navigate = useNavigate();
  const location = useLocation();
  const indexRef = useRef<number>(0);
  const wasReplacedRef = useRef(false);
  const isFirstRenderRef = useRef(true);

  const stableOnBack = useStableCallback(onBack);

  const pushState = useMemo(
    () =>
      (forceReplace = false) => {
        const shouldReplace =
          forceReplace || historyState[historyCursor]?.shouldBeReplaced;
        indexRef.current = shouldReplace ? historyCursor : ++historyCursor;
        historyCursor = indexRef.current;

        const previousRecord = historyState[indexRef.current];
        if (previousRecord && !previousRecord.isClosed) {
          previousRecord.markReplaced?.();
        }

        historyState[indexRef.current] = {
          index: indexRef.current,
          onBack: stableOnBack,
          shouldBeReplaced,
          markReplaced: () => {
            wasReplacedRef.current = true;
          },
          pathname: location.pathname,
        };

        deferHistoryOperation(
          {
            type: shouldReplace ? "replaceState" : "pushState",
            data: { index: indexRef.current, historyUniqueSessionId },
            hash: hash ? `#${hash}` : shouldResetUrlHash ? " " : undefined,
            pathname: location.pathname,
          },
          navigate,
        );
      },
    [
      hash,
      shouldBeReplaced,
      shouldResetUrlHash,
      stableOnBack,
      navigate,
      location.pathname,
    ],
  );

  const processBack = useCallback(() => {
    if (
      indexRef.current &&
      historyState[indexRef.current] &&
      !wasReplacedRef.current
    ) {
      historyState[indexRef.current].isClosed = true;

      wasReplacedRef.current = true;
      if (indexRef.current === historyCursor && !shouldBeReplaced) {
        historyCursor -= cleanupClosed(navigate);
      }
    }
  }, [shouldBeReplaced, navigate]);

  useEffect(() => {
    const handlePopstate = ({ state }: PopStateEvent) => {
      if (isAlteringHistory) {
        isAlteringHistory = false;
        if (deferredPopstateOperations.length) {
          applyDeferredHistoryOperations(navigate);
          deferredPopstateOperations = [];
        }
        return;
      }

      if (!state || state.historyUniqueSessionId !== historyUniqueSessionId) {
        cleanupTrashedState(navigate, location.pathname);
        if (window.location.hash) return;
      }

      const { index } = state as { index: number };
      if (index === historyCursor) return;

      if (index < historyCursor) {
        let closedCount = 0;
        let isAnimationDisabled = false;

        for (let i = historyCursor; i > index - closedCount; i--) {
          if (historyState[i]?.isClosed) {
            closedCount++;
            continue;
          }
          if (!isAnimationDisabled && isSafariGestureAnimation) {
            isAnimationDisabled = true;
          }
          historyState[i]?.onBack?.();
        }

        const totalClosed = cleanupClosed(navigate, closedCount);
        historyCursor = Math.max(0, index - totalClosed);
      } else {
        isAlteringHistory = true;
        deferHistoryOperation(
          { type: "go", delta: -(index - historyCursor) },
          navigate,
        );
      }
    };

    window.addEventListener("popstate", handlePopstate);
    return () => window.removeEventListener("popstate", handlePopstate);
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    return () => {
      if (isActive && !wasReplacedRef.current) processBack();
    };
  }, [isActive, processBack]);

  useEffect(() => {
    if (isFirstRenderRef.current && !isActive) return;
    if (isActive) {
      pushState();
    } else {
      processBack();
    }
  }, [isActive, pushState, processBack]);

  useEffect(() => {
    resetHistory(navigate, location.pathname);
  }, [navigate, location.pathname]);
}
