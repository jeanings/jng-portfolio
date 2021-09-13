import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';



// State for initial render.
const initialState: selectionProps = {
    selected: {}
}

// Create selection slice.
const selectionSlice = createSlice({
    name: 'selection',
    initialState,
    reducers: {
        // Save checkbox selections to retrieve data for generating charts.
        handleSelection: (state, action) => {
            const level = Object.keys(action.payload)[0];
            const category = action.payload[level].category;
            const selected = action.payload[level].selected;
            const name = action.payload[level].name;
            const partOf = action.payload[level].partOf;

            // Add or remove selection:
            if (selected === true) {
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
            } else if (selected === false) {
                delete state.selected[level][name];
            }
        },
        clearSelection: (state, action) => {
            const level: string = action.payload.level;
            const name: string = action.payload.name;
            delete state.selected[level][name];
        },
        clearAllSelections: (state, action) => {
            const clearAll: boolean = action.payload;

            if (clearAll === true) {
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
    }
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