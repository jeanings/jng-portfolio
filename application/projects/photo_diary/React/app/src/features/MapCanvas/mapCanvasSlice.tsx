import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';


/* ==============================================================================
    Slice for handling map loading status.
    Handles updates to << map >> state.
============================================================================== */

/* ------------------------------------------
    Handles updates to map loading status.
------------------------------------------ */
// State for initial render.
const initialState = {
    styleLoaded: false,
    sourceStatus: 'idle',
    markersStatus: 'idle'
};

const mapSlice = createSlice({
    name: 'map',
    initialState,
    reducers: {
        /* ---------------------------------------------------------------------
            Handles setting style loading status.
            Affects updating of source and layer effect once new data fetched.
        --------------------------------------------------------------------- */
        setStyleLoadStatus: (state, action: PayloadAction<boolean>) => {
            const loadStatus: boolean = action.payload;
            state.styleLoaded = loadStatus;           
        },
        /* -------------------------------------------------------
            Handles source added status.
            Affects marker layer adding effect.
        ------------------------------------------------------- */
        setSourceStatus: (state, action: PayloadAction<MapStatusProps['sourceStatus']>) => {
            const sourceStatus: MapStatusProps['sourceStatus'] = action.payload;
            state.sourceStatus = sourceStatus;
        },
         /* -------------------------------------------------------
            Handles marker layer added status.
            Affects marker layer adding effect.
        ------------------------------------------------------- */
        setMarkersStatus: (state, action: PayloadAction<MapStatusProps['markersStatus']>) => {
            const markersStatus: MapStatusProps['markersStatus'] = action.payload;
            state.markersStatus = markersStatus;
        },
        /* ------------------------------------------------------------
            Handles resetting both marker and source status to 'idle.
            Affects marker layer adding effect.
        ------------------------------------------------------------ */
        cleanupMarkerSource: (state, action: PayloadAction<MapStatusProps['markersStatus']>) => {
            const markerSourceStatus: MapStatusProps['markersStatus'] = action.payload;
            state.markersStatus = markerSourceStatus;
            state.sourceStatus = markerSourceStatus;
        }
    }
});


/* =====================================================================
    Types.
===================================================================== */
export interface MapStatusProps {
    [index: string]: boolean | 'idle' | 'loaded',
    styleLoaded: boolean,
    sourceStatus: 'idle' | 'loaded',
    markersStatus: 'idle' | 'loaded'
};

// Selector for selection state.
export const map = (state: RootState) => state.map;

// Export actions, reducers.
const { actions, reducer } = mapSlice;
export const { setStyleLoadStatus, setSourceStatus, setMarkersStatus, cleanupMarkerSource } = actions;
export default reducer;