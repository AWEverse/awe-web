import { createSlice } from "@reduxjs/toolkit";

export default createSlice({
  name: "auth",
  initialState: { isAuthenticated: false },
  reducers: {
    login: (state) => { state.isAuthenticated = true; },
    logout: (state) => { state.isAuthenticated = false; },

  },
}).reducer;
