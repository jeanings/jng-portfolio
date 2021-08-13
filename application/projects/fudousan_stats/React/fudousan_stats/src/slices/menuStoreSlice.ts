import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import MenuElementProps from '../containers/SidebarRegions';



// State for initial render.
const initialState: MenuStoreProps = {
    rendered: {}
}

// Create toggle slice.
const menuStoreSlice = createSlice({
    name: 'menuStore',
    initialState,
    reducers: {
        // Save previously rendered menu elements for recreating when 'back'ed.
        handleLevelStore: (state, action) => {
            const level: string = Object.keys(action.payload)[0];
            const elemPropsList: Array<typeof MenuElementProps> = action.payload[level];
            
            if (elemPropsList.length !== 0) {
                state.rendered = {
                    ...state.rendered,
                    [level]: elemPropsList
                }
            }
        },
        // Delete current level in state to render previous menu.
        handleStoreRemoval: (state, action) => {
            const level: string = action.payload;
            delete state.rendered[level];
        }
    }
});


// Types setting.
interface MenuStoreProps {
    [index: string] : string | any,
    rendered: {
        [index: string] : string | any
    }
}


// Selector for toggle state.
export const selectMenuStore = (state: RootState) => state.menuStore;

// Export actions, reducers.
const { actions, reducer } = menuStoreSlice;
export const { handleLevelStore, handleStoreRemoval } = actions;
export default reducer;