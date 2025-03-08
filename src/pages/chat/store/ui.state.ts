import { useSyncExternalStore } from 'react';
import {
  BitwiseCore,
  BitwiseBulk,
} from '@/lib/core'

export const enum ChatStateFlags {
  LEFT_PANEL_OPEN = 1 << 0,  // 0001
  SEARCH_ACTIVE = 1 << 1,    // 0010
  HEADER_ACTIVE = 1 << 2,    // 0100
  RIGHT_PANEL_OPEN = 1 << 3, // 1000
}

export type ChatState = number;

interface ChatStateManager {
  initialize(initialState: ChatState): void;
  getSnapshot(): ChatState;
  getServerSnapshot(): ChatState;
  subscribe(listener: () => void): () => void;
  set(flag: ChatStateFlags): void;
  unset(flag: ChatStateFlags): void;
  toggle(flag: ChatStateFlags): void;
  isEnabled(flag: ChatStateFlags): boolean;
  setMultiple(flags: ChatStateFlags[]): void;
  clear(): void;
}

const createChatStateManager = (): ChatStateManager => {
  const isServer = typeof window === 'undefined';
  let state: ChatState = 0;

  const listeners = new Set<() => void>();

  const emitChange = () => {
    if (!isServer) {
      listeners.forEach(listener => listener());
    }
  };

  return {
    initialize: (initialState: ChatState) => {
      state = initialState;
    },

    getSnapshot: () => state,

    getServerSnapshot: () => state,

    subscribe: (listener: () => void) => {
      if (!isServer) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      }
      return () => { };
    },

    set: (flag: ChatStateFlags) => {
      state = BitwiseCore.setFlag(state, flag);
      emitChange();
    },

    unset: (flag: ChatStateFlags) => {
      state = BitwiseCore.unsetFlag(state, flag);
      emitChange();
    },

    toggle: (flag: ChatStateFlags) => {
      state = BitwiseCore.toggleFlag(state, flag);
      emitChange();
    },

    isEnabled: (flag: ChatStateFlags) => BitwiseCore.hasFlag(state, flag),

    setMultiple: (flags: ChatStateFlags[]) => {
      state = BitwiseBulk.setMultiple(state, flags);
      emitChange();
    },

    clear: () => {
      state = 0;
      emitChange();
    }
  }
};

const ChatStateManager = createChatStateManager();

interface ChatStateHook {
  state: ChatState;
  isLeftPanelOpen: boolean;
  isSearchActive: boolean;
  isHeaderActive: boolean;
  isRightPanelOpen: boolean;
  setLeftPanelOpen: (value: boolean) => void;
  setSearchActive: (value: boolean) => void;
  setHeaderActive: (value: boolean) => void;
  setRightPanelOpen: (value: boolean) => void;
  toggleLeftPanel: () => void;
  toggleSearch: () => void;
  toggleHeader: () => void;
  toggleRightPanel: () => void;
  setMultiple: (flags: ChatStateFlags[]) => void;
  clear: () => void;
}

const createChatStateHook = (manager: ChatStateManager) => {
  return function useChatState(initialState?: ChatState): ChatStateHook {
    if (typeof initialState !== 'undefined') {
      manager.initialize(initialState);
    }

    const state = useSyncExternalStore(
      manager.subscribe,
      manager.getSnapshot,
      manager.getServerSnapshot
    );

    return {
      state,
      isLeftPanelOpen: manager.isEnabled(ChatStateFlags.LEFT_PANEL_OPEN),
      isSearchActive: manager.isEnabled(ChatStateFlags.SEARCH_ACTIVE),
      isHeaderActive: manager.isEnabled(ChatStateFlags.HEADER_ACTIVE),
      isRightPanelOpen: manager.isEnabled(ChatStateFlags.RIGHT_PANEL_OPEN),

      setLeftPanelOpen: (value: boolean) =>
        value
          ? manager.set(ChatStateFlags.LEFT_PANEL_OPEN)
          : manager.unset(ChatStateFlags.LEFT_PANEL_OPEN),

      setSearchActive: (value: boolean) =>
        value
          ? manager.set(ChatStateFlags.SEARCH_ACTIVE)
          : manager.unset(ChatStateFlags.SEARCH_ACTIVE),

      setHeaderActive: (value: boolean) =>
        value
          ? manager.set(ChatStateFlags.HEADER_ACTIVE)
          : manager.unset(ChatStateFlags.HEADER_ACTIVE),

      setRightPanelOpen: (value: boolean) =>
        value
          ? manager.set(ChatStateFlags.RIGHT_PANEL_OPEN)
          : manager.unset(ChatStateFlags.RIGHT_PANEL_OPEN),

      toggleLeftPanel: () => manager.toggle(ChatStateFlags.LEFT_PANEL_OPEN),
      toggleSearch: () => manager.toggle(ChatStateFlags.SEARCH_ACTIVE),
      toggleHeader: () => manager.toggle(ChatStateFlags.HEADER_ACTIVE),
      toggleRightPanel: () => manager.toggle(ChatStateFlags.RIGHT_PANEL_OPEN),

      setMultiple: manager.setMultiple,
      clear: manager.clear,
    };
  };
};

export const useChatState = createChatStateHook(ChatStateManager);
