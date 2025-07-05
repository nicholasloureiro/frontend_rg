import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/counterSlice';
import sidebarReducer from './slices/sidebarSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    sidebar: sidebarReducer,
  },
}); 