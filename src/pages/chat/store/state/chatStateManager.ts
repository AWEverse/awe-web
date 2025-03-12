import { BitwiseCore, BitwiseBulk, createListenersSet } from "@/lib/core";
import { ChatStateManager, ChatState, ChatStateFlags } from "./types";

let state: ChatState = 0;

const listeners = createListenersSet();

export default {
  initialize: (initialState: ChatState) => {
    state = initialState;
  },

  getSnapshot: () => state,

  getServerSnapshot: () => state,

  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  set: (flag: ChatStateFlags) => {
    state = BitwiseCore.setFlag(state, flag);
    listeners.emit();
  },

  unset: (flag: ChatStateFlags) => {
    state = BitwiseCore.unsetFlag(state, flag);
    listeners.emit();
  },

  toggle: (flag: ChatStateFlags) => {
    state = BitwiseCore.toggleFlag(state, flag);
    listeners.emit();
  },

  isEnabled: (flag: ChatStateFlags) => BitwiseCore.hasFlag(state, flag),

  setMultiple: (flags: ChatStateFlags[]) => {
    state = BitwiseBulk.setMultiple(state, flags);
    listeners.emit();
  },

  clear: () => {
    state = 0;
    listeners.emit();
  },
} as ChatStateManager;
