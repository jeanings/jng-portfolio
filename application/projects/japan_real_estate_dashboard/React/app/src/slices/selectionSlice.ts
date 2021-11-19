import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';



/* ------------------------------------------------------------------------------
    Slice that keeps track of what items are selected for displaying on charts.
    Handles updates to {selection} state.
------------------------------------------------------------------------------ */

// State for initial render.
const initialState: selectionProps = {
    selected: {},
    count: 0,
    prevRemoved: null
}


const selectionSlice = createSlice({
    /* ---------------------------------------------
        Handles updates to region items selection.
    --------------------------------------------- */
    name: 'selection',
    initialState,
    reducers: {
        handleSelection: (state, action) => {
            /* --------------------------------------------------------------------
                Saves checkbox selections to retrieve data for generating charts.
            -------------------------------------------------------------------- */
            const level = Object.keys(action.payload)[0];
            const category = action.payload[level].category;
            const selected = action.payload[level].selected;
            const name = action.payload[level].name;
            const partOf = action.payload[level].partOf;

            if (selected === true) {
                // Add selection.
                state.selected = {
                    ...state.selected,
                    [level]: {
                        ...state.selected[level],
                        [name]: {
                            category: category,
                            selected: selected,
                            partOf: partOf
                        }
                    }
                }
        
                state.count = state.count + 1;
            } else if (selected === false) {
                // Remove Selection.
                delete state.selected[level][name];
                state.count = state.count - 1;
                state.prevRemoved = name;
            }
        },
        clearSelection: (state, action) => {
            /* --------------------------------------------------------
                Deletes deselected items (for selected regions menu).
            -------------------------------------------------------- */
            const level: string = action.payload.level;
            const name: string = action.payload.name;

            delete state.selected[level][name];
            state.count = state.count - 1;
            state.prevRemoved = name;
        },
        clearAllSelections: (state, action) => {
            /* -----------------------------------------------------
                Clears all selections (for new query submissions).
            ----------------------------------------------------- */
            const clearAll: boolean = action.payload;

            if (clearAll === true) {
                state.count = 0;
                state.selected = {};
            }
        }
    }
});


// Types setting.
export interface selectionProps {
    [index: string]: string | any,
    selected: {
        // 'level 1'
        [key: string]: {
            // '関東'
            [key: string]: LevelRegionProps
        }
    },
    count: number,
    prevRemoved: string | null
}

type LevelRegionProps = {
    category: string,
    selected: boolean,
    partOf: PartOfProps | null
}

type PartOfProps = {
    category: string,
    name: string
}


// Selector for selection state.
export const selectSelection = (state: RootState) => state.selection;

// Export actions, reducers.
const { actions, reducer } = selectionSlice;
export const { handleSelection, clearSelection, clearAllSelections } = actions;
export default reducer;
