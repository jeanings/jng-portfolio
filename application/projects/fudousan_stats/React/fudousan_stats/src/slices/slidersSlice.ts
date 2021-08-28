import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';



// State for initial render.
const initialState: SlidersProps = {
   options: {
       buildingType: 'house',
       stationDist: '0_15',
       material: 'wood',
       age: '1920_1960',
       floorArea: '10_20'
   }
}

// Create selection slice.
const slidersSlice = createSlice({
    name: 'sliders',
    initialState,
    reducers: {
        // Save options, essentially acting as a form.
        handleSliders: (state, action) => {
            const name = Object.keys(action.payload)[0];
            const value = Object.values(action.payload)[0];

            state.options = {
                ...state.options,
                [name]: value
            }
        }
    }
});


// Types setting.
export interface SlidersProps {
    [index: string]: string | any,
    options: SlidersOptionsProps
}

type SlidersOptionsProps = {
    [index: string]: string | any,
    buildingType: string,
    stationDist: string,
    material: string,
    age: string,
    floorArea: string
}

// Selector for selection state.
export const selectSliders = (state: RootState) => state.sliders;

// Export actions, reducers.
const { actions, reducer } = slidersSlice;
export const { handleSliders } = actions;
export default reducer;