import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';



// State for initial render.
const initialState: MenuLevelProps = {
    active: {},
    direction: 'zoom in'
}

// Create menu item slice.
const menuLevelSlice = createSlice({
    name: 'menuLevel',
    initialState,
    reducers: {
        // Save 'markers' of which region was accessed in menu.
        handleMenuLevel: (state, action) => {
            const level: string = Object.keys(action.payload)[0];
            const category: string = action.payload[level].category;
            const name: string = action.payload[level].name;
            // console.log('handleMenu:', level, category);
            
            state.active = {
                ...state.active,
                [level]: {
                    category: category,
                    name: name
                }
            }    
        },
        // Switch for telling SidebarRegions which 'direction' to render.
        handleRenderDirection: (state, action) => {
            state.direction = action.payload;
        },
        // Remove current menu level marker.
        handleMenuLevelRemoval: (state, action) => {
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