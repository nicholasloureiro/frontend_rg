import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isSidebarCollapsed: false,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setSidebarState: (state, action) => {
      state.isSidebarCollapsed = action.payload;
    },
  },
});

export const { setSidebarState } = sidebarSlice.actions;
export default sidebarSlice.reducer; 