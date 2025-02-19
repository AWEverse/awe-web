import { useStableCallback } from "@/shared/hooks/base";
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
} from "react";

export interface BufferedRange {
  start: number;
  end: number;
}

interface BufferingState {
  isReady: boolean;
  isBuffered: boolean;
  bufferedProgress: number;
  bufferedRanges: BufferedRange[];
}

type BufferingAction =
  | { type: "SET_READY"; payload: boolean }
  | {
      type: "UPDATE_BUFFERING";
      payload: {
        bufferedRanges: BufferedRange[];
        bufferedProgress: number;
        isBuffered: boolean;
      };
    }
  | { type: "RESET" };

const initialState: BufferingState = {
  isReady: false,
  isBuffered: false,
  bufferedProgress: 0,
  bufferedRanges: [],
};

function bufferingReducer(
  state: BufferingState,
  action: BufferingAction,
): BufferingState {
  switch (action.type) {
    case "SET_READY":
      return { ...state, isReady: action.payload };
    case "UPDATE_BUFFERING":
      return { ...state, ...action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface BufferingContextValue extends BufferingState {
  checkBuffering: (media: HTMLMediaElement) => void;
}

const BufferingContext = createContext<BufferingContextValue>({
  ...initialState,
  checkBuffering: () => {},
});

interface BufferingProviderProps {
  mediaRef: React.RefObject<HTMLMediaElement | null>;
  children: React.ReactNode;
  onTimeUpdate?: (currentTime: number) => void;
  onBroken?: (errMessage?: string) => void;
}

export const BufferingProvider: React.FC<BufferingProviderProps> = ({
  mediaRef,
  children,
  onTimeUpdate,
  onBroken,
}) => {
  const [state, dispatch] = useReducer(bufferingReducer, initialState);

  const checkBuffering = useStableCallback((media: HTMLMediaElement) => {
    const { buffered, duration } = media;
    if (!duration) return;

    if (buffered.length > 0) {
      const ranges: BufferedRange[] = Array.from(
        { length: buffered.length },
        (_, i) => ({
          start: buffered.start(i),
          end: buffered.end(i),
        }),
      );
      const progress = buffered.end(0) / duration;

      dispatch({
        type: "UPDATE_BUFFERING",
        payload: {
          bufferedRanges: ranges,
          bufferedProgress: progress,
          isBuffered: progress >= 1,
        },
      });
    }
  });

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleProgress = () => checkBuffering(media);
    const handleLoadedData = () =>
      dispatch({ type: "SET_READY", payload: true });
    const handleTimeUpdate = () =>
      onTimeUpdate && onTimeUpdate(media.currentTime);
    const handleError = () => onBroken && onBroken("Buffering error occurred");

    media.addEventListener("progress", handleProgress);
    media.addEventListener("loadeddata", handleLoadedData);
    media.addEventListener("timeupdate", handleTimeUpdate);
    media.addEventListener("error", handleError);

    return () => {
      media.removeEventListener("progress", handleProgress);
      media.removeEventListener("loadeddata", handleLoadedData);
      media.removeEventListener("timeupdate", handleTimeUpdate);
      media.removeEventListener("error", handleError);
    };
  }, [mediaRef, checkBuffering, onTimeUpdate, onBroken]);

  const contextValue = useMemo(
    () => ({
      ...state,
      checkBuffering,
    }),
    [state, checkBuffering],
  );

  return (
    <BufferingContext.Provider value={contextValue}>
      {children}
    </BufferingContext.Provider>
  );
};

export const useBufferingContext = () => useContext(BufferingContext);
