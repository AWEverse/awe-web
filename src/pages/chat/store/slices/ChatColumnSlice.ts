import { StateCreator } from 'zustand';
import { SliceStateFactory } from '../types';

type ChatColumnState = SliceStateFactory<['ChatSearching', 'ChatPinning']>;

const createChatColumnSlice: StateCreator<ChatColumnState, [], [], ChatColumnState> = (set, get) => ({
  isChatSearching: false,
  isChatPinning: false,

  // Toggle and close functions
  toggleChatPinning: () => set(state => ({ isChatPinning: !state.isChatPinning })),
  openChatPinning: () => set({ isChatPinning: true }),
  closeChatPinning: () => set({ isChatPinning: false }),

  toggleChatSearching: () => set(state => ({ isChatSearching: !state.isChatSearching })),
  openChatSearching: () => set({ isChatSearching: true }),
  closeChatSearching: () => set({ isChatSearching: false }),

  // Getter functions
  getIsChatSearching: () => get().isChatSearching,
  getIsChatPinning: () => get().isChatPinning,
});

export default createChatColumnSlice;
export type { ChatColumnState };
