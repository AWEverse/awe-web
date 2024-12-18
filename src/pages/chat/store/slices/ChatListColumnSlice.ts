import { StateCreator } from 'zustand';
import { SliceStateFactory } from '../types';
import { LeftColumnScreenType } from '../../types/LeftColumn';

type FabricState = SliceStateFactory<['ChatList', 'Footer']>;

interface OwnState {
  screen: LeftColumnScreenType;
  setScreen: (screen: LeftColumnScreenType) => void;
  resetScreen: () => void;
}

type ChatListColumnState = FabricState & OwnState;

const createChatListColumnSlice: StateCreator<ChatListColumnState, [], [], ChatListColumnState> = (
  set,
  get,
) => ({
  isFooter: false,
  isChatList: false,
  screen: LeftColumnScreenType.Main,

  setScreen: (screen: LeftColumnScreenType) => set({ screen }),
  resetScreen: () => set({ screen: LeftColumnScreenType.Main }),

  toggleFooter: () => set({ isFooter: !get().isFooter }),
  openFooter: () => set({ isFooter: true }),
  closeFooter: () => set({ isFooter: false }),

  toggleChatList: () => set({ isChatList: !get().isChatList }),
  openChatList: () => set({ isChatList: true }),
  closeChatList: () => set({ isChatList: false }),

  getIsChatList: () => get().isChatList,
  getIsFooter: () => get().isFooter,
});

export default createChatListColumnSlice;
export type { ChatListColumnState };
