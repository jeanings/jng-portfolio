import { configureStore, Action, ThunkAction } from '@reduxjs/toolkit';
import slidersReducer from './slices/slidersSlice';



export const store = configureStore({
  reducer: {
    sliders: slidersReducer,
  }
});


export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export default store;