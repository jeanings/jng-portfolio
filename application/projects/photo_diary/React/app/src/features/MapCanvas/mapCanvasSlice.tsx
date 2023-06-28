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
const initialState: MapStatusProps = {
    styleLoaded: false,
    sourceStatus: 'idle',
    markersStatus: 'idle',
    fitBoundsButton: 'idle',
    markerLocator: 'idle',
    markerLocatorEventSource: null
};

const mapCanvasSlice = createSlice({
    name: 'mapCanvas',
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
        /* -------------------------------------
            Handles source added status.
            Affects marker layer adding effect.
        ------------------------------------- */
        setSourceStatus: (state, action: PayloadAction<MapStatusProps['sourceStatus']>) => {
            const sourceStatus: MapStatusProps['sourceStatus'] = action.payload;
            state.sourceStatus = sourceStatus;
        },
         /* ------------------------------------
            Handles marker layer added status.
            Affects marker layer adding effect.
        ------------------------------------- */
        setMarkersStatus: (state, action: PayloadAction<MapStatusProps['markersStatus']>) => {
            const markersStatus: MapStatusProps['markersStatus'] = action.payload;
            state.markersStatus = markersStatus;
        },
        /* ------------------------------------------------------------
            Handles resetting both marker and source status to 'idle'.
            Affects marker layer adding effect.
        ------------------------------------------------------------ */
        cleanupMarkerSource: (state, action: PayloadAction<MapStatusProps['markersStatus']>) => {
            const markerSourceStatus: MapStatusProps['markersStatus'] = action.payload;
            state.markersStatus = markerSourceStatus;
            state.sourceStatus = markerSourceStatus;
        },
        /* --------------------------------------------
            Handles fitBounds toolbar button.
            Calls hook in MapCanvas to call fitBounds.
        -------------------------------------------- */
        handleBoundsButton: (state, action: PayloadAction<MapStatusProps['fitBoundsButton']>) => {
            const fitBoundsStatus: MapStatusProps['fitBoundsButton'] = action.payload;
            state.fitBoundsButton = fitBoundsStatus;
        },
        /* ----------------------------------------
            Handles image enlarger marker locator.
        ----------------------------------------- */
        handleMarkerLocator: (state, action: PayloadAction<MapStatusProps['markerLocator']>) => {
            const locatorStatus: MapStatusProps['markerLocator'] = action.payload;
            state.markerLocator = locatorStatus;
        },
        /* ----------------------------------------
            Handles marker click .
        ----------------------------------------- */
        handleMarkerLocatorEventSource: (state, action: PayloadAction<MapStatusProps['markerLocatorEventSource']>) => {
            const clickSource: MapStatusProps['markerLocatorEventSource'] = action.payload;
            state.markerLocatorEventSource = clickSource;
        }
    }
});


/* =====================================================================
    Types.
===================================================================== */
export interface MapStatusProps {
    [index: string]: boolean | 'idle' | 'loaded' | 'clicked' | 'mapClick' | 'thumbClick' | null,
    styleLoaded: boolean,
    sourceStatus: 'idle' | 'loaded',
    markersStatus: 'idle' | 'loaded',
    fitBoundsButton: 'idle' | 'clicked'
    markerLocator: 'idle' | 'clicked',
    markerLocatorEventSource: 'mapClick' | 'thumbClick' | null 
};


// Selector for selection state.
export const mapCanvas = (state: RootState) => state.mapCanvas;

// Export actions, reducers.
const { actions, reducer } = mapCanvasSlice;
export const {
    setStyleLoadStatus, 
    setSourceStatus, 
    setMarkersStatus, 
    cleanupMarkerSource, 
    handleBoundsButton, 
    handleMarkerLocator,
    handleMarkerLocatorEventSource } = actions;
export default reducer;