import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';


/* ==============================================================================
    Slice for handling addition/removal of filter parameters.
    Handles updates to << filter >> state.
============================================================================== */

/* ------------------------------------------
    Handles updates to filter selection.
------------------------------------------ */
// State for initial render.
const initialState: FilterProps = {
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
        addFilter: (state, action: PayloadAction<FilterPayloadType>) => {
            const filterRequest = Object.entries(action.payload);

            for (let [category, param] of filterRequest) {
                state[category]!.push(param as string | number)
            }
        },
        /* ---------------------------------------------------
            Handles adding filter to existing array in state.
        --------------------------------------------------- */
        addBulkFilters: (state, action: PayloadAction<FilterPayloadType>) => {
            const filterRequest = action.payload;

            for (let [category, params] of Object.entries(filterRequest)) {
                state[category] = params as any;
            }
        },
        /* -------------------------------------------------------
            Handles removing filter from existing array in state.
        ------------------------------------------------------- */
        removeFilter: (state, action: PayloadAction<FilterPayloadType>) => {
            const filterRequest = Object.entries(action.payload);
            
            for (let [category, param] of filterRequest) {
                if (state[category]!.includes(param as string | number)){
                    let updatedArray = state[category]!.filter(x => x !== param);
                    state[category] = updatedArray;
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
    [index: string]: Array<string | number>,
    'formatMedium': Array<string>,
    'formatType': Array<string>,
    'film': Array<string>,
    'camera': Array<string>,
    'lens': Array<string>,
    'focalLength': Array<number>,
    'tags': Array<string>
};

export interface FilterPayloadType {
    [index: string]: string | number | undefined,
    'make'?: string,
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
export const { addFilter, addBulkFilters, removeFilter, clearFilters } = actions;
export default reducer;