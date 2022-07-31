import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';



/* ------------------------------------------------------------------------------
    Slice for handling current selection of timeline; year and month.
    Handles updates to {dateSelection} state.
------------------------------------------------------------------------------ */

// State for initial render.
const initialState: TimelineProps = {
    year: '',
    month: 'all'
}


const timelineSlice = createSlice({
    /* ---------------------------------------------
        Handles updates to timeline selection.
    --------------------------------------------- */
    name: 'timeline',
    initialState,
    reducers: {
        handleTimelineYear: (state, action: PayloadAction<TimelineProps["year"]>) => {
            /* --------------------------
                Saves selection of year.
            -------------------------- */
            const selectedYear = action.payload;
            
            state.year = selectedYear;
        },
        handleTimelineMonth: (state, action: PayloadAction<TimelineProps["month"]>) => {
            /* -----------------------------
                Saves selection of month(s)
            ------------------------------ */
            const selectedMonth = action.payload;

            state.month = selectedMonth;
        }
    }
});


// Types setting.
export interface TimelineProps {
    [index: string]: string | any,
    year: string,
    month: TimelineMonthTypes
}

export type TimelineMonthTypes = 
    'jan' | 'feb' | 'mar' |
    'apr' | 'may' | 'jun' |
    'jul' | 'aug' | 'sep' |
    'oct' | 'nov' | 'dec' |
    'all';


// Selector for selection state.
export const timelineSelection = (state: RootState) => state.timeline;

// Export actions, reducers.
const { actions, reducer } = timelineSlice;
export const { handleTimelineYear, handleTimelineMonth } = actions;
export default reducer;
