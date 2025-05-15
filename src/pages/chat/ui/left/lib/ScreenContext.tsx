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
    direction: "left",
    stack: [],
  });

  const goTo = useStableCallback((nextScreen: Screen) => {
    const { currentScreen } = navigationState;

    if (nextScreen === currentScreen) return;

    // Validate transition
    if (!transitionCache[currentScreen]?.has(nextScreen)) {
      DEBUG &&
        console.warn(
          `Invalid transition blocked: ${currentScreen} → ${nextScreen}`,
        );
      return;
    }

    setNavigationState((prev) => {
      const newStack = [...prev.stack];

      // Only add to stack if transition is valid
      newStack.push(prev.currentScreen);
      if (newStack.length > MAX_HISTORY_SIZE) {
        newStack.shift(); // Keep history bounded
      }

      return {
        currentScreen: transition(prev.currentScreen, nextScreen),
        direction: "right",
        stack: newStack,
      };
    });
  });

  const goBack = useStableCallback(() => {
    setNavigationState((prev) => {
      const { stack, currentScreen } = prev;

      if (stack.length === 0) {
        DEBUG && console.warn("No screen to go back to; returning to fallback");
        return {
          currentScreen: FALLBACK_SCREEN,
          direction: "left",
          stack: [],
        };
      }

      // Pop last valid screen from stack
      const previousScreen = stack.pop()!;

      // Ensure transition is allowed before proceeding
      if (!transitionCache[currentScreen]?.has(previousScreen)) {
        DEBUG &&
          console.warn(
            `Invalid back transition blocked: ${currentScreen} → ${previousScreen}`,
          );

        // Optionally continue popping until valid screen found
        while (stack.length > 0) {
          const candidate = stack.pop()!;
          if (transitionCache[currentScreen]?.has(candidate)) {
            return {
              currentScreen: transition(currentScreen, candidate),
              direction: "left",
              stack,
            };
          }
        }

        // If none found, fallback
        return {
          currentScreen: FALLBACK_SCREEN,
          direction: "left",
          stack: [],
        };
      }

      return {
        currentScreen: transition(currentScreen, previousScreen),
        direction: "left",
        stack,
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
