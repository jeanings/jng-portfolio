import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';
import MenuElementProps from '../containers/SidebarRegions';



/* --------------------------------------------------------------------------
    Slice that saves JSX element props that were rendered (parent regions).
    Used in re-rendering previous menu items when 'back' is pressed.
-------------------------------------------------------------------------- */

// State for initial render.
const initialState: MenuStoreProps = {
    rendered: {}
}


const menuStoreSlice = createSlice({
    /* ---------------------------------------------------------------------------------
        Slice that handles saving and removing of previously rendered elements' props.
    --------------------------------------------------------------------------------- */
    name: 'menuStore',
    initialState,
    reducers: {
        handleLevelStore: (state, action) => {
            /* ----------------------------------------------------------------
                Saves previous props for recreating menu items when 'back'ed.
            ---------------------------------------------------------------- */
            const level: string = Object.keys(action.payload)[0];
            const elemPropsList: Array<typeof MenuElementProps> = action.payload[level];
            
            if (elemPropsList.length !== 0) {
                state.rendered = {
                    ...state.rendered,
                    [level]: elemPropsList
                }
            }
        },
        handleStoreRemoval: (state, action) => {
            /* -----------------------------------------------------------------------
                Delete current level in state to trigger rendering of previous menu.
            ----------------------------------------------------------------------- */
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
