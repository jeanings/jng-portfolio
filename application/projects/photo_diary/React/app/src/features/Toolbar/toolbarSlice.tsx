import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';


/* ================================================================
    Slice for handling button states for showing/hiding elements.
================================================================ */

// State for initial render.
const initialState: ToolbarProps = {
    filter: 'off',
    imageEnlarger: 'off'
};

const toolbarSlice = createSlice({
    name: 'toolbar',
    initialState,
    reducers: {
        /* ------------------------------------------------------------------------
            Handles opened/closed states of filterDrawer and imageEnlarger panels.
        ------------------------------------------------------------------------ */
        handleToolbarButtons: (state, action: PayloadAction<ToolbarProps>) => {
            const buttonUpdates = action.payload;
            
            // Update states requested.
            Object.keys(buttonUpdates).forEach((key: string) => {
                state[key] = buttonUpdates[key];
            });
        }
    }
});


/* =====================================================================
    Types.
===================================================================== */
export interface ToolbarProps {
    [index: string]: 'on' | 'off' | 'hidden' | undefined
    filter?: 'on' | 'off' ,
    imageEnlarger?: 'on' | 'off' | 'hidden'
};


// Selector for selection state.
export const toolbar = (state: RootState) => state.toolbar;

// Export actions, reducers.
const { actions, reducer } = toolbarSlice;
export const { handleToolbarButtons } = actions;
export default reducer;