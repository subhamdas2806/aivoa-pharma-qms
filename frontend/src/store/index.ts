import { configureStore } from '@reduxjs/toolkit';
import complaintReducer from './complaintSlice';

export const store = configureStore({
  reducer: {
    complaint: complaintReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
