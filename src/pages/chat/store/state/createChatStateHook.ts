import { useSyncExternalStore } from "react";
import { ChatStateManager, ChatStateFlags } from "./types";

export interface ChatStateHook {
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;
  isRightPanelEditing: boolean;
  isMiddleSearchOpen: boolean;
  isMiddlePinnedMessagesOpen: boolean;

  setLeftPanelOpen: (value: boolean) => void;

  setRightPanelOpen: (value: boolean) => void;
  setRightPanelEditingOpen: (value: boolean) => void;

  setMiddleSearchOpen: (value: boolean) => void;
  setMiddlePinnedMessagesOpen: (value: boolean) => void;

  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleRightEditingPanel: () => void;

  toggleMiddleSearch: () => void;
  toggleMiddlePinnedMessages: () => void;
}

export default function (manager: ChatStateManager): ChatStateHook {
  useSyncExternalStore(
    manager.subscribe,
    manager.getSnapshot,
    manager.getServerSnapshot,
  );

  return {
    isLeftPanelOpen: manager.isEnabled(ChatStateFlags.LEFT_PANEL_OPEN),
    isRightPanelOpen: manager.isEnabled(ChatStateFlags.RIGHT_PANEL_OPEN),
    isMiddleSearchOpen: manager.isEnabled(ChatStateFlags.MIDDLE_SEARCH_OPEN),
    isMiddlePinnedMessagesOpen: manager.isEnabled(
      ChatStateFlags.MIDDLE_PINNED_MESSAGES_OPEN,
    ),
    isRightPanelEditing: manager.isEnabled(ChatStateFlags.RIGHT_PANEL_EDITING_OPEN),

    setLeftPanelOpen: (value: boolean) =>
      value
        ? manager.set(ChatStateFlags.LEFT_PANEL_OPEN)
        : manager.unset(ChatStateFlags.LEFT_PANEL_OPEN),

    setRightPanelOpen: (value: boolean) =>
      value
        ? manager.set(ChatStateFlags.RIGHT_PANEL_OPEN)
        : manager.unset(ChatStateFlags.RIGHT_PANEL_OPEN),

    setRightPanelEditingOpen: (value: boolean) =>
      value
        ? manager.set(ChatStateFlags.RIGHT_PANEL_EDITING_OPEN)
        : manager.unset(ChatStateFlags.RIGHT_PANEL_EDITING_OPEN),

    setMiddleSearchOpen: (value: boolean) =>
      value
        ? manager.set(ChatStateFlags.MIDDLE_SEARCH_OPEN)
        : manager.unset(ChatStateFlags.MIDDLE_SEARCH_OPEN),

    setMiddlePinnedMessagesOpen: (value: boolean) =>
      value
        ? manager.set(ChatStateFlags.MIDDLE_PINNED_MESSAGES_OPEN)
        : manager.unset(ChatStateFlags.MIDDLE_PINNED_MESSAGES_OPEN),

    toggleLeftPanel: () => manager.toggle(ChatStateFlags.LEFT_PANEL_OPEN),
    toggleRightPanel: () => manager.toggle(ChatStateFlags.RIGHT_PANEL_OPEN),
    toggleRightEditingPanel: () => manager.toggle(ChatStateFlags.RIGHT_PANEL_EDITING_OPEN),
    toggleMiddleSearch: () => manager.toggle(ChatStateFlags.MIDDLE_SEARCH_OPEN),
    toggleMiddlePinnedMessages: () =>
      manager.toggle(ChatStateFlags.MIDDLE_PINNED_MESSAGES_OPEN),
  };
}
