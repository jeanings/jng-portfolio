import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';



/* -----------------------------------------------------
    Slice that keeps track of what's currently in view.
    Handles updates to {menuLevel} state.
------------------------------------------------------ */

// State for initial render.
const initialState: MenuLevelProps = {
    active: {},
    direction: 'zoom in'
}


const menuLevelSlice = createSlice({
    /* -------------------------------------------------------------------------------
        Handles what is currently in view, direction of render, and level deletion.
    ------------------------------------------------------------------------------- */
    name: 'menuLevel',
    initialState,
    reducers: {
        handleMenuLevel: (state, action) => {
            /* -------------------------------------------------------
                Save markers for which region was accessed in menu.
            ------------------------------------------------------- */
            const level: string = Object.keys(action.payload)[0];
            const category: string = action.payload[level].category;
            const name: string = action.payload[level].name;
            
            state.active = {
                ...state.active,
                [level]: {
                    category: category,
                    name: name
                }
            }    
        },
        handleRenderDirection: (state, action) => {
            /* -----------------------------------------------------------------
                Switch for telling SidebarRegions which direction to render.
            ----------------------------------------------------------------- */
            state.direction = action.payload;
        },
        handleMenuLevelRemoval: (state, action) => {
            /* -------------------------------
                Remove current level marker.
            ------------------------------- */
            const level: string = action.payload;
            delete state.active[level];
        }
    }
});


// Types setting.
interface MenuLevelProps {
    [index: string] : string | any, 
    active: {
        [index: string] : string | any
    }
}


// Selector for toggle state.
export const selectMenuLevel = (state: RootState) => state.menuLevel;

// Export actions, reducers.
const { actions, reducer } = menuLevelSlice;
export const { handleMenuLevel, handleRenderDirection, handleMenuLevelRemoval } = actions;
export default reducer;
