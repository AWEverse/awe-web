import React, { createContext, useContext, useMemo, useState } from "react";
import { Screen, transition, screenTransitions } from "./screenTransitions";
import { useStableCallback } from "@/shared/hooks/base";
import { DEBUG } from "@/lib/config/dev";

const MAX_HISTORY_SIZE = 50;
const FALLBACK_SCREEN: Screen = "Main";

export interface ScreenContextType {
  currentScreen: Screen;
  goTo: (screen: Screen) => void;
  goBack: () => void;
}

interface NavigationStack {
  entries: Screen[];
  head: number;
  size: number;
}

const LeftScreenNavigationContext = createContext<
  ScreenContextType | undefined
>(undefined);

const transitionCache = (() => {
  const cache: Record<Screen, Set<Screen>> = {} as Record<Screen, Set<Screen>>;
  for (const screen of Object.keys(screenTransitions) as Screen[]) {
    cache[screen] = new Set(screenTransitions[screen]);
  }
  return cache;
})();

export const LeftScreenNavigationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [navigationState, setNavigationState] = useState<{
    currentScreen: Screen;
    stack: NavigationStack;
  }>({
    currentScreen: "Main",
    stack: {
      entries: new Array(MAX_HISTORY_SIZE).fill(null),
      head: 0,
      size: 0,
    },
  });

  const goTo = useStableCallback((screen: Screen) => {
    if (screen === navigationState.currentScreen) {
      return;
    }

    try {
      // Validate transition using cache
      if (!transitionCache[navigationState.currentScreen].has(screen)) {
        throw new Error(
          `Invalid transition: ${navigationState.currentScreen} -> ${screen}`,
        );
      }

      setNavigationState((prev) => {
        const newStack = { ...prev.stack };
        const prevScreen = prev.currentScreen;

        if (newStack.size < MAX_HISTORY_SIZE) {
          newStack.entries[newStack.head] = prevScreen;
          newStack.head = (newStack.head + 1) % MAX_HISTORY_SIZE;
          newStack.size++;
        } else {
          newStack.entries[newStack.head] = prevScreen;
          newStack.head = (newStack.head + 1) % MAX_HISTORY_SIZE;
        }

        return {
          currentScreen: transition(prev.currentScreen, screen),
          stack: newStack,
        };
      });
    } catch (error) {
      DEBUG && console.error(`Navigation error: ${error}`);
    }
  });

  const goBack = useStableCallback(() => {
    if (navigationState.stack.size === 0) {
      DEBUG && console.warn("No history to go back to");
      setNavigationState((prev) => ({
        ...prev,
        currentScreen: FALLBACK_SCREEN,
      }));
      return;
    }

    setNavigationState((prev) => {
      let newStack = { ...prev.stack };
      let current = prev.currentScreen;
      let attempts = newStack.size;

      // Iteratively find a valid previous screen
      while (newStack.size > 0 && attempts > 0) {
        const prevHead =
          (newStack.head - 1 + MAX_HISTORY_SIZE) % MAX_HISTORY_SIZE;
        const previousScreen = newStack.entries[prevHead];

        try {
          if (transitionCache[current].has(previousScreen)) {
            // Valid transition found
            newStack.head = prevHead;
            newStack.size--;
            return {
              currentScreen: transition(current, previousScreen),
              stack: newStack,
            };
          } else {
            // Invalid transition, pop and continue
            throw new Error(
              `Invalid back transition: ${current} -> ${previousScreen}`,
            );
          }
        } catch (error) {
          DEBUG && console.error(`Go back error: ${error}`);
          newStack.head = prevHead;
          newStack.size--;
          current = previousScreen; // Try the next entry
          attempts--;
        }
      }

      // No valid history found, fallback to default
      DEBUG && console.warn("No valid history entries, falling back");
      return {
        currentScreen: FALLBACK_SCREEN,
        stack: {
          entries: new Array(MAX_HISTORY_SIZE).fill(null),
          head: 0,
          size: 0,
        },
      };
    });
  });

  const contextValue = useMemo(
    () => ({
      currentScreen: navigationState.currentScreen,
      goTo,
      goBack,
    }),
    [navigationState.currentScreen, goTo, goBack],
  );

  return (
    <LeftScreenNavigationContext.Provider value={contextValue}>
      {children}
    </LeftScreenNavigationContext.Provider>
  );
};

export const useLeftScreenNavigation = (): ScreenContextType => {
  const context = useContext(LeftScreenNavigationContext);
  if (!context) {
    throw new Error(
      "useLeftScreenNavigation must be used within a LeftScreenNavigationProvider",
    );
  }
  return context;
};

export default LeftScreenNavigationProvider;
