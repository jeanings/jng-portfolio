import {
    combineReducers, 
    configureStore,
    PreloadedState,
    ThunkAction, 
    Action } from '@reduxjs/toolkit';
import timelineReducer from '../features/TimelineBar/timelineSlice';
import filterReducer from '../features/FilterDrawer/filterDrawerSlice';
import mapCanvasReducer from '../features/MapCanvas/mapCanvasSlice';
import sideFilmStripReducer from '../features/SideFilmStrip/sideFilmStripSlice';
import toolbarReducer from '../features/Toolbar/toolbarSlice';
import loginReducer from '../features/Login/loginSlice';
import editorReducer from '../features/Editor/editorSlice';


// Create the root reducer independently to obtain the RootState type.
const rootReducer = combineReducers({
    timeline: timelineReducer,
    filter: filterReducer,
    mapCanvas: mapCanvasReducer,
    sideFilmStrip: sideFilmStripReducer,
    toolbar: toolbarReducer,
    login: loginReducer,
    editor: editorReducer
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
        mapCanvas: mapCanvasReducer,
        sideFilmStrip: sideFilmStripReducer,
        toolbar: toolbarReducer,
        login: loginReducer,
        editor: editorReducer
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