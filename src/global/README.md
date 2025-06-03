# Global State Management System

A powerful, type-safe Redux-based state management system with advanced features including dynamic reducer injection, optimized selectors, higher-order components (HOCs), and comprehensive TypeScript support.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [Store Setup](#store-setup)
- [Creating Slices](#creating-slices)
- [Selectors](#selectors)
- [Hooks](#hooks)
- [Higher-Order Components (HOCs)](#higher-order-components-hocs)
- [Dynamic Reducers](#dynamic-reducers)
- [Type Safety](#type-safety)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [API Reference](#api-reference)

## Overview

This global state management system provides:

- **Type-safe Redux store** with automatic type inference
- **Dynamic reducer injection** for code splitting and lazy loading
- **Optimized selectors** with memoization and parameterization
- **Advanced hooks** for complex state operations
- **Higher-order components** for seamless component integration
- **Comprehensive TypeScript support** with strict typing

## Quick Start

### 1. Installation and Setup

```typescript
import { store, RootState, AppDispatch } from '@/global';

// Use the store in your app
export default function App() {
  return (
    <Provider store={store}>
      <YourApp />
    </Provider>
  );
}
```

### 2. Basic Usage with Hooks

```typescript
import { useAppSelector, useAppDispatch } from '@/global';

function MyComponent() {
  const playerState = useAppSelector(state => state.player);
  const dispatch = useAppDispatch();

  return (
    <div>
      <p>Position: {playerState.position.x}, {playerState.position.y}</p>
      <button onClick={() => dispatch(movePlayer({ x: 100, y: 100 }))}>
        Move Player
      </button>
    </div>
  );
}
```

## Core Concepts

### Base State Interface

All state slices should extend the `BaseState` interface:

```typescript
import { BaseState } from '@/global';

interface MyState extends BaseState {
  // Your state properties
  readonly data: string;
  // loading and error are automatically included
}
```

### Shared Store Type

The store includes a reducer manager for dynamic operations:

```typescript
type SharedStore<S> = S & {
  reducerManager: ReducerManager;
};
```

## Store Setup

The store is pre-configured with:

- Redux Toolkit for state management
- Dynamic reducer injection capability
- Development tools integration
- Type-safe dispatch and selectors

```typescript
import { store, RootState, AppDispatch } from '@/global';

// Access the store
const currentState: RootState = store.getState();
const dispatch: AppDispatch = store.dispatch;
```

## Creating Slices

### Standard Slice Creation

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BaseState } from '@/global';

interface UserState extends BaseState {
  readonly profile: {
    readonly name: string;
    readonly email: string;
  } | null;
  readonly preferences: {
    readonly theme: 'light' | 'dark';
    readonly language: string;
  };
}

const initialState: UserState = {
  profile: null,
  preferences: {
    theme: 'light',
    language: 'en'
  },
  loading: false,
  error: null
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserState['profile']>) => {
      state.profile = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.preferences.theme = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const { setProfile, setTheme, setLoading, setError } = userSlice.actions;
export default userSlice.reducer;
```

## Selectors

### Basic Selectors

```typescript
import { RootState } from '@/global';

// Simple selector
export const selectUserProfile = (state: RootState) => state.user.profile;

// Computed selector
export const selectUserDisplayName = (state: RootState) =>
  state.user.profile?.name || 'Anonymous';
```

### Memoized Selectors

```typescript
import { createMemoizedSelector } from '@/global';

// Automatically memoized for performance
export const selectUserPreferences = createMemoizedSelector(
  [(state: RootState) => state.user],
  (user) => user.preferences
);

// Complex computed selector
export const selectUserSettings = createMemoizedSelector(
  [selectUserProfile, selectUserPreferences],
  (profile, preferences) => ({
    displayName: profile?.name || 'Anonymous',
    theme: preferences.theme,
    language: preferences.language,
    isLoggedIn: !!profile
  })
);
```

### Parameterized Selectors

```typescript
import { createParametrizedSelector } from '@/global';

// Selector that accepts parameters
export const selectUserPermissions = createParametrizedSelector(
  (roleId: string) => createMemoizedSelector(
    [(state: RootState) => state.user.profile],
    (profile) => {
      // Complex logic based on roleId parameter
      return profile?.roles?.includes(roleId) || false;
    }
  )
);

// Usage
const hasAdminRole = useAppSelector(selectUserPermissions('admin'));
```

### Conditional Selectors

```typescript
import { createConditionalSelector } from '@/global';

// Selector with conditional logic
export const selectUserStatus = createConditionalSelector(
  (state: RootState) => state.user.loading,
  (loading) => loading,
  () => ({ status: 'loading', message: 'Loading user data...' }),
  (_, state) => ({
    status: 'ready',
    message: state.user.error || 'User data loaded'
  })
);
```

## Hooks

### Basic Hooks

```typescript
import { useAppSelector, useAppDispatch } from '@/global';

function UserProfile() {
  const profile = useAppSelector(state => state.user.profile);
  const dispatch = useAppDispatch();

  const handleUpdateProfile = (newProfile: UserProfile) => {
    dispatch(setProfile(newProfile));
  };

  return (
    <div>
      <h1>{profile?.name || 'Guest'}</h1>
      {/* Profile UI */}
    </div>
  );
}
```

### Advanced Hooks

#### useMemoizedSelector

```typescript
import { useMemoizedSelector } from '@/global';

function UserDashboard() {
  // Automatically memoized selector
  const userSettings = useMemoizedSelector(
    (state) => ({
      name: state.user.profile?.name,
      theme: state.user.preferences.theme,
      isOnline: state.user.profile !== null
    })
  );

  return <div>Welcome, {userSettings.name}!</div>;
}
```

#### useParametrizedSelector

```typescript
import { useParametrizedSelector } from '@/global';

function PermissionCheck({ permission }: { permission: string }) {
  // Parameterized selector with args
  const hasPermission = useParametrizedSelector(
    (perm: string) => (state: RootState) =>
      state.user.profile?.permissions?.includes(perm) || false,
    [permission] // Dependencies
  );

  return hasPermission ? <AdminPanel /> : <AccessDenied />;
}
```

#### useTypedActions

```typescript
import { useTypedActions } from '@/global';

function UserControls() {
  // Typed action creators
  const actions = useTypedActions((dispatch) => ({
    login: (credentials: LoginCredentials) => {
      dispatch(setLoading(true));
      // Async login logic
    },
    logout: () => {
      dispatch(setProfile(null));
      dispatch(setLoading(false));
    },
    updateTheme: (theme: 'light' | 'dark') => {
      dispatch(setTheme(theme));
    }
  }));

  return (
    <div>
      <button onClick={() => actions.updateTheme('dark')}>
        Dark Mode
      </button>
      <button onClick={actions.logout}>
        Logout
      </button>
    </div>
  );
}
```

#### useStateChangeEffect

```typescript
import { useStateChangeEffect } from '@/global';

function UserNotifications() {
  // React to state changes
  useStateChangeEffect(
    (state) => state.user.error,
    (currentError, previousError) => {
      if (currentError && currentError !== previousError) {
        // Show error notification
        showToast(currentError, 'error');
      }
    }
  );

  return <div>User notifications will appear here</div>;
}
```

#### useCombinedSelectors

```typescript
import { useCombinedSelectors } from '@/global';

function UserSummary() {
  // Combine multiple selectors
  const data = useCombinedSelectors({
    profile: (state) => state.user.profile,
    preferences: (state) => state.user.preferences,
    loading: (state) => state.user.loading,
    hasNotifications: (state) => state.notifications.unread > 0
  });

  if (data.loading) return <LoadingSpinner />;

  return (
    <div>
      <h1>{data.profile?.name}</h1>
      <p>Theme: {data.preferences.theme}</p>
      {data.hasNotifications && <NotificationBadge />}
    </div>
  );
}
```

#### useNestedState

```typescript
import { useNestedState } from '@/global';

function ThemeSelector() {
  // Direct access to nested state
  const theme = useNestedState('user', 'preferences');

  return (
    <select value={theme.theme}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
}
```

## Higher-Order Components (HOCs)

### withGlobalState

Connect components to global state without hooks:

```typescript
import { withGlobalState } from '@/global';

interface Props {
  className?: string;
}

interface StateProps {
  userProfile: UserProfile | null;
  theme: string;
}

interface DispatchProps {
  updateProfile: (profile: UserProfile) => void;
  logout: () => void;
}

const UserCard: React.FC<Props & StateProps & DispatchProps> = ({
  className,
  userProfile,
  theme,
  updateProfile,
  logout
}) => (
  <div className={`user-card ${theme} ${className}`}>
    <h2>{userProfile?.name || 'Guest'}</h2>
    <button onClick={logout}>Logout</button>
  </div>
);

export default withGlobalState(
  // State selector
  (state: RootState): StateProps => ({
    userProfile: state.user.profile,
    theme: state.user.preferences.theme
  }),
  // Action creators
  (dispatch: AppDispatch): DispatchProps => ({
    updateProfile: (profile) => dispatch(setProfile(profile)),
    logout: () => dispatch(setProfile(null))
  }),
  // Options
  {
    useShallowEqual: true,
    memoizeDispatch: true,
    displayName: 'ConnectedUserCard'
  }
)(UserCard);
```

### Typed HOCs

#### createTypedHOC

```typescript
import { createTypedHOC } from '@/global';

// Create a reusable HOC for user data
const withUserData = createTypedHOC({
  selector: (state: RootState) => ({
    user: state.user.profile,
    loading: state.user.loading,
    error: state.user.error
  }),
  actions: (dispatch: AppDispatch) => ({
    refreshUser: () => {
      // Refresh logic
    }
  })
});

// Use with any component
const MyComponent = withUserData(({ user, loading, refreshUser }) => (
  <div>
    {loading ? <Spinner /> : <UserInfo user={user} />}
    <button onClick={refreshUser}>Refresh</button>
  </div>
));
```

#### createSliceConnector

```typescript
import { createSliceConnector } from '@/global';

// Connect to specific slice
const withPlayerState = createSliceConnector({
  slice: 'player',
  selector: (playerState) => ({
    position: playerState.position,
    isVisible: playerState.isVisible
  }),
  actions: (dispatch) => ({
    movePlayer: (pos: Position) => dispatch(movePlayer(pos))
  })
});
```

#### createCompositeConnector

```typescript
import { createCompositeConnector } from '@/global';

// Combine multiple state sources
const withCompositeData = createCompositeConnector({
  selectors: {
    user: (state: RootState) => state.user.profile,
    player: (state: RootState) => state.player.position,
    notifications: (state: RootState) => state.notifications.unread
  },
  actionsFactory: (dispatch: AppDispatch) => ({
    updateUser: (user: UserProfile) => dispatch(setProfile(user)),
    movePlayer: (pos: Position) => dispatch(movePlayer(pos))
  }),
  options: {
    trackPropChanges: true
  }
});
```

#### createConditionalConnector

```typescript
import { createConditionalConnector } from '@/global';

// Conditional state connection
const withConditionalData = createConditionalConnector({
  condition: (state: RootState) => state.user.profile !== null,
  activeSelector: (state: RootState) => ({
    userData: state.user.profile,
    isAuthenticated: true
  }),
  inactiveSelector: () => ({
    userData: null,
    isAuthenticated: false
  })
});
```

## Dynamic Reducers

### Injecting Reducers at Runtime

```typescript
import { injectSlice, removeSlice } from '@/global';

// Define a dynamic slice
const dynamicSlice = createSlice({
  name: 'dynamic',
  initialState: { data: [] },
  reducers: {
    setData: (state, action) => {
      state.data = action.payload;
    }
  }
});

// Inject when needed (e.g., route change, feature loading)
export function loadDynamicFeature() {
  injectSlice({
    name: 'dynamic',
    reducer: dynamicSlice.reducer
  });
}

// Remove when no longer needed
export function unloadDynamicFeature() {
  removeSlice('dynamic');
}
```

### Global Reducer Manager

```typescript
import { GlobalReducerManager } from '@/global';

// Access the reducer manager
const manager = store.reducerManager;

// Add reducer
manager.add('newFeature', newFeatureReducer);

// Remove reducer
manager.remove('oldFeature');

// Check if reducer exists
if (manager.has('featureName')) {
  // Feature is loaded
}

// Get current reducer keys
const activeFeatures = manager.getReducerMap();
```

## Type Safety

### Strict Typing

The system provides comprehensive TypeScript support:

```typescript
// All types are automatically inferred
import { RootState, AppDispatch } from '@/global';

// State is fully typed
function useTypedComponent() {
  const state = useAppSelector((state: RootState) => {
    // state.user.profile is typed as UserProfile | null
    // state.player.position is typed as Position
    return {
      userName: state.user.profile?.name, // string | undefined
      playerX: state.player.position.x    // number
    };
  });

  const dispatch = useAppDispatch(); // Fully typed dispatch

  // Actions are type-checked
  dispatch(setProfile({ name: 'John', email: 'john@example.com' }));
}
```

### Custom Type Guards

```typescript
// Create type guards for better type safety
export function isUserLoggedIn(
  profile: UserProfile | null
): profile is UserProfile {
  return profile !== null;
}

// Usage
function UserArea() {
  const profile = useAppSelector(state => state.user.profile);

  if (isUserLoggedIn(profile)) {
    // profile is now typed as UserProfile (not null)
    return <div>Welcome, {profile.name}!</div>;
  }

  return <LoginForm />;
}
```

## Best Practices

### 1. State Structure

- **Keep state flat**: Avoid deep nesting
- **Use readonly types**: Enforce immutability
- **Extend BaseState**: Include loading and error states

```typescript
// ✅ Good
interface UserState extends BaseState {
  readonly profile: UserProfile | null;
  readonly preferences: UserPreferences;
}

// ❌ Avoid
interface UserState {
  user: {
    profile: {
      data: {
        name: string;
        // Deep nesting
      };
    };
  };
}
```

### 2. Selector Organization

- **Create reusable selectors**: Share common logic
- **Use memoized selectors**: Optimize performance
- **Group related selectors**: Keep them organized

```typescript
// userSelectors.ts
export const selectUserProfile = (state: RootState) => state.user.profile;
export const selectUserPreferences = (state: RootState) => state.user.preferences;
export const selectIsUserLoggedIn = createMemoizedSelector(
  [selectUserProfile],
  (profile) => profile !== null
);
```

### 3. Action Organization

- **Use action creators**: Don't dispatch plain objects
- **Group related actions**: Keep slice actions together
- **Type action payloads**: Ensure type safety

```typescript
// ✅ Good
export const userActions = {
  setProfile,
  updatePreferences,
  logout: () => setProfile(null)
};

// Usage
dispatch(userActions.setProfile(newProfile));
```

### 4. Component Integration

- **Prefer hooks**: Use hooks over HOCs when possible
- **Minimize re-renders**: Use shallow equality checks
- **Separate concerns**: Keep business logic in selectors

```typescript
// ✅ Good - Using hooks
function UserComponent() {
  const user = useAppSelector(selectUserProfile);
  const dispatch = useAppDispatch();

  return <UserCard user={user} onUpdate={(u) => dispatch(setProfile(u))} />;
}

// ✅ Also good - Using HOC for complex connections
const UserComponent = withGlobalState(
  selectUserWithPreferences,
  userActionCreators
)(PureUserCard);
```

### 5. Performance Optimization

- **Use memoized selectors**: Prevent unnecessary recalculations
- **Implement shallow equality**: Reduce re-renders
- **Split large states**: Use dynamic reducers for features

```typescript
// Memoized selector for expensive computations
export const selectExpensiveComputation = createMemoizedSelector(
  [selectLargeDataSet],
  (data) => data.filter(/* complex filter */).map(/* complex transform */)
);
```

## Examples

### Complete Feature Implementation

```typescript
// features/chat/model/types.ts
export interface Message {
  readonly id: string;
  readonly text: string;
  readonly userId: string;
  readonly timestamp: number;
}

export interface ChatState extends BaseState {
  readonly messages: readonly Message[];
  readonly activeRoom: string | null;
  readonly typingUsers: readonly string[];
}

// features/chat/model/slice.ts
const initialState: ChatState = {
  messages: [],
  activeRoom: null,
  typingUsers: [],
  loading: false,
  error: null
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setActiveRoom: (state, action: PayloadAction<string | null>) => {
      state.activeRoom = action.payload;
    },
    setTypingUsers: (state, action: PayloadAction<string[]>) => {
      state.typingUsers = action.payload;
    }
  }
});

// features/chat/model/selectors.ts
export const selectChatMessages = createMemoizedSelector(
  [(state: RootState) => state.chat.messages],
  (messages) => messages
);

export const selectActiveRoomMessages = createMemoizedSelector(
  [selectChatMessages, (state: RootState) => state.chat.activeRoom],
  (messages, activeRoom) =>
    messages.filter(msg => msg.roomId === activeRoom)
);

// features/chat/ui/ChatRoom.tsx
export function ChatRoom() {
  const messages = useAppSelector(selectActiveRoomMessages);
  const typingUsers = useAppSelector(state => state.chat.typingUsers);
  const dispatch = useAppDispatch();

  const sendMessage = useCallback((text: string) => {
    dispatch(chatSlice.actions.addMessage({
      id: generateId(),
      text,
      userId: getCurrentUserId(),
      timestamp: Date.now()
    }));
  }, [dispatch]);

  return (
    <div className="chat-room">
      <MessageList messages={messages} />
      <TypingIndicator users={typingUsers} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
```

## API Reference

### Core Exports

```typescript
// Store and types
export { store, RootState, AppDispatch }

// Basic hooks
export { useAppSelector, useAppDispatch }

// Advanced hooks
export {
  useMemoizedSelector,
  useParametrizedSelector,
  useTypedActions,
  useStateChangeEffect,
  useSelectorWithFallback,
  useCombinedSelectors,
  useNestedState,
  useTypedSelector
}

// Selector utilities
export {
  createMemoizedSelector,
  createParametrizedSelector,
  createConditionalSelector,
  createTypedSelector,
  createNestedSelector,
  createMultiPropertySelector
}

// HOCs and connectors
export {
  withGlobalState,
  createTypedHOC,
  createSliceConnector,
  createCompositeConnector,
  createConditionalConnector,
  createTypedActions
}

// Dynamic reducers
export {
  injectSlice,
  removeSlice,
  GlobalReducerManager
}

// Types
export {
  BaseState,
  SharedStore
}
```

### Hook Signatures

```typescript
// Basic hooks
function useAppSelector<T>(selector: (state: RootState) => T, equalityFn?: (a: T, b: T) => boolean): T
function useAppDispatch(): AppDispatch

// Advanced hooks
function useMemoizedSelector<T>(selector: (state: RootState) => T, equalityFn?: (a: T, b: T) => boolean): T
function useParametrizedSelector<T, Args>(selectorFactory: (...args: Args) => (state: RootState) => T, args: Args, equalityFn?: (a: T, b: T) => boolean): T
function useTypedActions<T>(actionsFactory: (dispatch: AppDispatch) => T): T
function useStateChangeEffect<T>(selector: (state: RootState) => T, callback: (current: T, previous: T | undefined) => void, equalityFn?: (a: T, b: T) => boolean): void
function useSelectorWithFallback<T>(selector: (state: RootState) => T | undefined, fallback: T, equalityFn?: (a: T, b: T) => boolean): T
function useCombinedSelectors<T>(selectors: { [K in keyof T]: (state: RootState) => T[K] }): T
function useNestedState<K extends keyof RootState, P extends keyof RootState[K]>(stateKey: K, propertyKey: P, equalityFn?: (a: RootState[K][P], b: RootState[K][P]) => boolean): RootState[K][P]
```

This comprehensive system provides everything needed for scalable, type-safe state management in React applications. The combination of Redux Toolkit, dynamic reducers, optimized selectors, and advanced hooks creates a powerful foundation for complex applications while maintaining excellent developer experience and runtime performance.
