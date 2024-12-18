import { create } from 'zustand';
import {
  ProfileColumnState,
  ChatColumnState,
  ChatListColumnState,
  createProfileColumnSlice,
  createChatColumnSlice,
  createChatListColumnSlice,
} from './slices';

type StoreState = ProfileColumnState & ChatColumnState & ChatListColumnState;

const useChatStore = create<StoreState>()((...a) => ({
  ...createProfileColumnSlice(...a),
  ...createChatColumnSlice(...a),
  ...createChatListColumnSlice(...a),
}));

export default useChatStore;
