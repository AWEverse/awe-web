import { RootState } from "@/global";

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
