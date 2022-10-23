import {
    combineReducers, 
    configureStore,
    PreloadedState,
    ThunkAction, 
    Action } from '@reduxjs/toolkit';
import timelineReducer from '../features/TimelineBar/timelineSlice';
import filterReducer from '../features/FilterDrawer/filterDrawerSlice';
import mapReducer from '../features/MapCanvas/mapCanvasSlice';


// Create the root reducer independently to obtain the RootState type.
const rootReducer = combineReducers({
    timeline: timelineReducer,
    filter: filterReducer,
    mapCanvas: mapReducer
});

export function setupStore(preloadedState?: PreloadedState<RootState>) {
    return configureStore({
        reducer: rootReducer,
        preloadedState
    });
};

export const store = configureStore({
    reducer: {
        timeline: timelineReducer,
        filter: filterReducer,
        mapCanvas: mapReducer
    },
});

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']

export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;

export default store;