import React from "react";
import { withGlobalState } from "../hocs/withGlobalState";
import {
  createTypedHOC,
  createCompositeConnector,
  createConditionalConnector,
  createTypedActions,
} from "../hocs/typedConnectors";
import { createMemoizedSelector } from "../core/selectors";
import {
  useNestedState,
  useCombinedSelectors,
  useTypedActions,
  useStateChangeEffect,
} from "../core/typedHooks";
import type { RootState, AppDispatch } from "../core";
import type { PlayerState } from "../reducers/playerReducer";

/**
 * Пример использования оптимизированного withGlobalState
 */

// Пример компонента
interface ExampleComponentProps {
  title: string;
}

interface StateProps {
  playerPosition: PlayerState["position"];
  playerSize: PlayerState["size"];
  isAuthenticated: boolean;
}

interface DispatchProps {
  updatePosition: (x: number, y: number) => void;
  login: () => void;
}

const ExampleComponent: React.FC<
  ExampleComponentProps & StateProps & DispatchProps
> = ({
  title,
  playerPosition,
  playerSize,
  isAuthenticated,
  updatePosition,
  login,
}) => {
  return (
    <div>
      <h1>{title}</h1>
      <p>
        Position: {playerPosition.x}, {playerPosition.y}
      </p>
      <p>
        Size: {playerSize.width}x{playerSize.height}
      </p>
      <p>Auth: {isAuthenticated ? "Yes" : "No"}</p>
      <button onClick={() => updatePosition(100, 100)}>Update Position</button>
      <button onClick={login}>Login</button>
    </div>
  );
};

// Мемоизированные селекторы
const selectPlayerData = createMemoizedSelector(
  [
    (state: RootState) => state.player.position,
    (state: RootState) => state.player.size,
  ],
  (position, size) => ({ position, size }),
);

const selectAuthData = (state: RootState) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

// Component for basic example (includes all props for demonstration)
const BasicExampleComponent: React.FC<StateProps & DispatchProps> = ({
  playerPosition,
  playerSize,
  isAuthenticated,
  updatePosition,
  login,
}) => {
  return (
    <div>
      <h1>Basic Example</h1>
      <p>
        Position: {playerPosition.x}, {playerPosition.y}
      </p>
      <p>
        Size: {playerSize.width}x{playerSize.height}
      </p>
      <p>Auth: {isAuthenticated ? "Yes" : "No"}</p>
      <button onClick={() => updatePosition(100, 100)}>Update Position</button>
      <button onClick={login}>Login</button>
    </div>
  );
};

// Использование с базовой типизацией
export const BasicExample = withGlobalState(
  (state: RootState): StateProps => ({
    ...selectPlayerData(state),
    playerPosition: selectPlayerData(state).position,
    playerSize: selectPlayerData(state).size,
    isAuthenticated: selectAuthData(state).isAuthenticated,
  }),
  (_dispatch: AppDispatch): DispatchProps => ({
    updatePosition: (x, y) => {
      // dispatch player actions
      console.log("Update position:", x, y);
    },
    login: () => {
      // dispatch auth actions
      console.log("Login");
    },
  }),
  {
    useShallowEqual: true,
    memoizeDispatch: true,
    memoComponent: true,
    displayName: "ExampleWithState",
  },
)(BasicExampleComponent);

// Component without title prop for state-only examples
const StateOnlyComponent: React.FC<{
  playerPosition: PlayerState["position"];
  isAuthenticated: boolean;
}> = ({ playerPosition, isAuthenticated }) => {
  return (
    <div>
      <h1>State Only Example</h1>
      <p>
        Position: {playerPosition.x}, {playerPosition.y}
      </p>
      <p>Auth: {isAuthenticated ? "Yes" : "No"}</p>
    </div>
  );
};

// Component for custom equality example
const CustomEqualityComponent: React.FC<{
  playerPosition: PlayerState["position"];
  playerSize: PlayerState["size"];
}> = ({ playerPosition, playerSize }) => {
  return (
    <div>
      <h1>Custom Equality Example</h1>
      <p>
        Position: {playerPosition.x}, {playerPosition.y}
      </p>
      <p>
        Size: {playerSize.width}x{playerSize.height}
      </p>
    </div>
  );
};

// Component for performance example
const PerformanceComponent: React.FC<{
  x: number;
  y: number;
}> = ({ x, y }) => {
  return (
    <div>
      <h1>Performance Example</h1>
      <p>
        Position: {x}, {y}
      </p>
    </div>
  );
};

// Пример с только state props
export const StateOnlyExample = withGlobalState(
  (state: RootState) => ({
    playerPosition: state.player.position,
    isAuthenticated: state.auth.isAuthenticated,
  }),
  {
    useShallowEqual: true,
    displayName: "StateOnlyExample",
  },
)(StateOnlyComponent);

// Пример с кастомной функцией сравнения
export const CustomEqualityExample = withGlobalState(
  (state: RootState) => ({
    playerPosition: state.player.position,
    playerSize: state.player.size,
  }),
  {
    equalityFn: (left, right) => {
      // Кастомная логика сравнения
      return (
        left.playerPosition.x === right.playerPosition.x &&
        left.playerPosition.y === right.playerPosition.y &&
        left.playerSize.width === right.playerSize.width &&
        left.playerSize.height === right.playerSize.height
      );
    },
    displayName: "CustomEqualityExample",
  },
)(CustomEqualityComponent);

// Пример с отключенной мемоизацией для производительности
export const PerformanceExample = withGlobalState(
  (state: RootState) => ({
    // Простые примитивы, не требующие мемоизации
    x: state.player.position.x,
    y: state.player.position.y,
  }),
  {
    useShallowEqual: false,
    memoComponent: false,
    displayName: "PerformanceExample",
  },
)(PerformanceComponent);

// Усовершенствованный пример с типизированными коннекторами
const OptimizedExampleComponent = createTypedHOC({
  selector: createMemoizedSelector(
    [
      (state: RootState) => state.player.position,
      (state: RootState) => state.player.size,
      (state: RootState) => state.auth.isAuthenticated,
    ],
    (position, size, isAuthenticated) => ({
      playerPosition: position,
      playerSize: size,
      isAuthenticated,
    }),
  ),
  actionsFactory: createTypedActions((_dispatch: AppDispatch) => ({
    updatePosition: (x: number, y: number) => {
      console.log("Update position:", x, y);
    },
    login: () => {
      console.log("Login action");
    },
  })),
  options: {
    useShallowEqual: true,
    memoizeDispatch: true,
    enablePerformanceMonitoring: true,
  },
})(ExampleComponent);

// Пример с композитными селекторами
const CompositeExample = createCompositeConnector({
  selectors: {
    position: (state: RootState) => state.player.position,
    size: (state: RootState) => state.player.size,
    isAuth: (state: RootState) => state.auth.isAuthenticated,
  },
  actionsFactory: (_dispatch: AppDispatch) => ({
    updatePosition: (x: number, y: number) => {
      console.log("Update position:", x, y);
    },
  }),
  options: {
    trackPropChanges: true,
  },
})(ExampleComponent);

// Пример с условным коннектором
const ConditionalExample = createConditionalConnector({
  condition: (state: RootState) => state.auth.isAuthenticated,
  activeSelector: (state: RootState) => ({
    playerPosition: state.player.position,
    playerSize: state.player.size,
    isAuthenticated: true,
  }),
  inactiveSelector: () => ({
    playerPosition: { x: 0, y: 0 },
    playerSize: { width: 0, height: 0 },
    isAuthenticated: false,
  }),
})(ExampleComponent);

// Пример использования типизированных хуков
const HookExampleComponent: React.FC<{ title: string }> = ({ title }) => {
  // Простой типизированный селектор
  const position = useNestedState("player", "position");

  // Параметризованный селектор (commented out to avoid unused variable warning)
  // const playerData = useParametrizedSelector(
  //   (playerId: string) => (state: RootState) => state.player.position,
  //   ["player1"],
  // );

  // Композитный селектор
  const combinedData = useCombinedSelectors({
    position: (state: RootState) => state.player.position,
    size: (state: RootState) => state.player.size,
  });

  // Типизированные действия
  const actions = useTypedActions((_dispatch: AppDispatch) => ({
    updatePosition: (x: number, y: number) => {
      console.log("Update position:", x, y);
    },
    resetPlayer: () => {
      console.log("Reset player");
    },
  }));

  // Отслеживание изменений состояния
  useStateChangeEffect(
    (state: RootState) => state.player.position,
    (current, previous) => {
      console.log("Position changed:", { current, previous });
    },
  );

  return (
    <div>
      <h1>{title}</h1>
      <p>
        Position: {position.x}, {position.y}
      </p>
      <p>
        Size: {combinedData.size.width}x{combinedData.size.height}
      </p>
      <button onClick={() => actions.updatePosition(100, 100)}>
        Update Position
      </button>
      <button onClick={actions.resetPlayer}>Reset Player</button>
    </div>
  );
};

export {
  OptimizedExampleComponent,
  CompositeExample,
  ConditionalExample,
  HookExampleComponent,
};
