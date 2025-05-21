import { createSlice } from '@reduxjs/toolkit';


export default createSlice({
  name: 'dummy',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; },
    decrement: (state) => { state.value -= 1; },
  },
}).reducer;
