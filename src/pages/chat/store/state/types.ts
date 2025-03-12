/**
 * Bitwise flags representing various states of a chat application.
 * Each flag occupies a unique bit position, allowing combination via bitwise operations.
 * Only for global events
 */
export const enum ChatStateFlags {
  LEFT_PANEL_OPEN = 1 << 0,
  RIGHT_PANEL_OPEN = 1 << 1,
  RIGHT_PANEL_EDITING_OPEN = 1 << 2,
  MIDDLE_SEARCH_OPEN = 1 << 3,
  MIDDLE_PINNED_MESSAGES_OPEN = 1 << 4,
}

export type ChatState = number;

export interface ChatStateManager {
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
