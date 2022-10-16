import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { FilterableTypes } from '../TimelineBar/timelineSlice';


/* ==============================================================================
    Slice for handling addition/removal of filter parameters.
    Handles updates to << filter >> state.
============================================================================== */

/* ------------------------------------------
    Handles updates to filter selection.
------------------------------------------ */
// State for initial render.
const initialState: FilterableTypes = {
    formatMedium: [],
    formatType: [],
    film: [],
    camera: [],
    lens: [],
    focalLength: [],
    tags: []
};

const filterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        /* ---------------------------------------------------
            Handles adding filter to existing array in state.
        --------------------------------------------------- */
        addFilter: (state, action: PayloadAction<FilterProps>) => {
            const filterRequest = Object.entries(action.payload);

            for (let [key, val] of filterRequest) {
                state[key]!.push(val as string | number)
            }
        },
        /* -------------------------------------------------------
            Handles removing filter from existing array in state.
        ------------------------------------------------------- */
        removeFilter: (state, action: PayloadAction<FilterProps>) => {
            const filterRequest = Object.entries(action.payload);

            for (let [key, val] of filterRequest) {
                if (state[key]!.includes(val as string | number)){
                    let updatedArray = state[key]!.filter(x => x !== val);
                    state[key] = updatedArray;
                }
            }
        },
        /* -------------------------------------------------------
            Handles clearing of entire filter state.
        ------------------------------------------------------- */
        clearFilters: (state, action: PayloadAction<string>) => {
            const clearRequest: string = action.payload;
            if (clearRequest === "RESET TO INIT STATE") {
                Object.assign(state, initialState);
            }
        }
    }
});


/* =====================================================================
    Types.
===================================================================== */
export interface FilterProps {
    [index: string]: string | number | undefined,
    'make?'?: string,
    'model'?: string,
    'camera'?: string,
    'film'?: string,
    'focalLength'?: number,
    'formatMedium'?: string,
    'formatType'?: string,
    'lens'?: string,
    'tags'?: string
};

// Selector for selection state.
export const filterSelection = (state: RootState) => state.filter;

// Export actions, reducers.
const { actions, reducer } = filterSlice;
export const { addFilter, removeFilter, clearFilters } = actions;
export default reducer;