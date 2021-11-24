import { configureStore, Action, ThunkAction } from '@reduxjs/toolkit';
import selectionReducer from './slices/selectionSlice';
import menuLevelReducer from './slices/menuLevelSlice';
import menuStoreReducer from './slices/menuStoreSlice';
import menuApiReducer from './slices/menuApiSlice';
import slidersReducer from './slices/slidersSlice';
import dataReducer from './slices/dataSlice';
import mapReducer from './slices/mapSlice';
import languageReducer from './slices/languageSlice';



export const store = configureStore({
  reducer: {
    selection: selectionReducer,
    menuLevel: menuLevelReducer,
    menuStore: menuStoreReducer,
    menuApi: menuApiReducer,
    sliders: slidersReducer,
    data: dataReducer,
    map: mapReducer,
    language: languageReducer
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
