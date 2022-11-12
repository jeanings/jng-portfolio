import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { ImageDocTypes } from '../TimelineBar/timelineSlice';


/* ==============================================================================
    Slice for handling expanded view in side panel 'film strip' component.
============================================================================== */

// State for initial render.
const initialState: SideFilmStripProps = {
    enlargeDoc: null
};

const sideFilmStripSlice = createSlice({
    name: 'sideFilmStrip',
    initialState,
    reducers: {
        /* ------------------------------------------------------------------
            Handles setting clicked image in film strip or map marker to be 
            shown, enlarged, to the left of film strip panel.
        ------------------------------------------------------------------ */
        handleEnlarger: (state, action: PayloadAction<SideFilmStripProps['enlargeDoc']>) => {
            const imageDoc = action.payload;
            state.enlargeDoc = imageDoc;
        }
    }
});


/* =====================================================================
    Types.
===================================================================== */
export interface SideFilmStripProps {
    [index: string]: ImageDocTypes | null,
    enlargeDoc: ImageDocTypes | null ,
};


// Selector for selection state.
export const sideFilmStrip = (state: RootState) => state.sideFilmStrip;

// Export actions, reducers.
const { actions, reducer } = sideFilmStripSlice;
export const { handleEnlarger } = actions;
export default reducer;