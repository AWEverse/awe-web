import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import {
  ProfileColumnState,
  ChatColumnState,
  ChatListColumnState,
  createProfileColumnSlice,
  createChatColumnSlice,
  createChatListColumnSlice,
} from './slices';

type StoreState = ProfileColumnState & ChatColumnState & ChatListColumnState;

const useChatStore = create<StoreState>()(
  devtools((...a) => ({
    ...createProfileColumnSlice(...a),
    ...createChatColumnSlice(...a),
    ...createChatListColumnSlice(...a),
  }), { name: 'ChatStore' })
);


export default useChatStore;
export type { StoreState };
