// slices/profileColumnSlice.ts
import { StateCreator } from 'zustand';
import { SliceStateFactory } from '../types';

export type ProfileColumnState = SliceStateFactory<['ProfileColumn', 'ProfileEditing']> & {
  toggleProfileColumn: () => void;
  openProfileColumn: () => void;
  closeProfileColumn: () => void;
  getIsProfileColumn: () => boolean;

  toggleProfileEditing: () => void;
  openProfileEditing: () => void;
  closeProfileEditing: () => void;
  getIsProfileEditing: () => boolean;
};

const createProfileColumnSlice: StateCreator<
  ProfileColumnState,
  [],
  [],
  ProfileColumnState
> = (set, get) => ({
  isProfileColumn: false,
  isProfileEditing: false,

  toggleProfileColumn: () => set((state) => ({ isProfileColumn: !state.isProfileColumn })),
  openProfileColumn: () => set({ isProfileColumn: true }),
  closeProfileColumn: () => set({ isProfileColumn: false }),
  getIsProfileColumn: () => get().isProfileColumn,

  toggleProfileEditing: () => set((state) => ({ isProfileEditing: !state.isProfileEditing })),
  openProfileEditing: () => set({ isProfileEditing: true }),
  closeProfileEditing: () => set({ isProfileEditing: false }),
  getIsProfileEditing: () => get().isProfileEditing,
});

export default createProfileColumnSlice;
