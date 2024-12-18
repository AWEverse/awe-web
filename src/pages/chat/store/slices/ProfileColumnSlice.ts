import { StateCreator } from 'zustand';
import { SliceStateFactory } from '../types';

type ProfileColumnState = SliceStateFactory<['ProfileColumn', 'ProfileEditing']>;

const createProfileColumnSlice: StateCreator<ProfileColumnState, [], [], ProfileColumnState> = (set, get) => ({
  isProfileColumn: false,
  isProfileEditing: false,

  toggleProfileColumn: () => set(state => ({ isProfileColumn: !state.isProfileColumn })),
  openProfileColumn: () => set({ isProfileColumn: true }),
  closeProfileColumn: () => set({ isProfileColumn: false }),
  getIsProfileColumn: () => get().isProfileColumn,

  toggleProfileEditing: () => set(state => ({ isProfileEditing: !state.isProfileEditing })),
  openProfileEditing: () => set({ isProfileEditing: true }),
  closeProfileEditing: () => set({ isProfileEditing: false }),
  getIsProfileEditing: () => get().isProfileEditing,
});

export default createProfileColumnSlice;
export type { ProfileColumnState };
