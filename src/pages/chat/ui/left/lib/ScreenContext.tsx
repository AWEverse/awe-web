import React, { createContext, useContext, useMemo, useState } from "react";
import { Screen, transition, screenTransitions } from "./screenTransitions";
import { useStableCallback } from "@/shared/hooks/base";
import { DEBUG } from "@/lib/config/dev";

const MAX_HISTORY_SIZE = 50;
const FALLBACK_SCREEN: Screen = "Main";

export type Direction = "left" | "right";

export interface ScreenContextType {
  currentScreen: Screen;
  direction: Direction;
  goTo: (screen: Screen) => void;
  goBack: () => void;
}

interface NavigationState {
  currentScreen: Screen;
  direction: Direction;
  stack: Screen[];
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
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentScreen: FALLBACK_SCREEN,
    direction: "right",
    stack: [],
  });

  const goTo = useStableCallback((screen: Screen) => {
    if (screen === navigationState.currentScreen) return;

    try {
      if (!transitionCache[navigationState.currentScreen]?.has(screen)) {
        throw new Error(
          `Invalid transition: ${navigationState.currentScreen} -> ${screen}`,
        );
      }

      setNavigationState((prev) => {
        const newStack = [...prev.stack];
        newStack.push(prev.currentScreen);
        if (newStack.length > MAX_HISTORY_SIZE) newStack.shift();

        return {
          currentScreen: transition(prev.currentScreen, screen),
          direction: "right",
          stack: newStack,
        };
      });
    } catch (error) {
      DEBUG && console.error(`Navigation error: ${error}`);
    }
  });

  const goBack = useStableCallback(() => {
    setNavigationState((prev) => {
      const newStack = [...prev.stack];
      let attempts = newStack.length;
      let current = prev.currentScreen;

      while (newStack.length > 0 && attempts-- > 0) {
        const previousScreen = newStack.pop()!;
        if (transitionCache[current]?.has(previousScreen)) {
          return {
            currentScreen: transition(current, previousScreen),
            direction: "left",
            stack: newStack,
          };
        } else {
          DEBUG &&
            console.warn(
              `Invalid back transition: ${current} -> ${previousScreen}`,
            );
          current = previousScreen; // пробуем откатиться дальше
        }
      }

      DEBUG &&
        console.warn("No valid back transition found, fallback to default");
      return {
        currentScreen: FALLBACK_SCREEN,
        direction: "left",
        stack: [],
      };
    });
  });

  const contextValue = useMemo(
    () => ({
      currentScreen: navigationState.currentScreen,
      direction: navigationState.direction,
      goTo,
      goBack,
    }),
    [navigationState.currentScreen, navigationState.direction, goTo, goBack],
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
