import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { ImageDocTypes } from '../TimelineBar/timelineSlice';


/* ==============================================================================
    Slice for handling expanded view in side panel 'film strip' component.
============================================================================== */

// State for initial render.
const initialState: SideFilmStripProps = {
    enlargeDoc: null,
    docIndex: null,
    slideView: 'off'
};

const sideFilmStripSlice = createSlice({
    name: 'sideFilmStrip',
    initialState,
    reducers: {
        /* ------------------------------------------------------------------
            Handles setting clicked image in film strip or map marker to be 
            shown, enlarged, to the left of film strip panel.
        ------------------------------------------------------------------ */
        handleEnlarger: (state, action: PayloadAction<SideFilmStripProps>) => {
            const payload = action.payload;
            const doc = payload.enlargeDoc;
            const index = payload.docIndex;

            state.enlargeDoc = doc;
            state.docIndex = index;
        },
        /* ---------------------------------------------------------------------
            Handles toggling overlay for viewing enlarged image in full screen.
        --------------------------------------------------------------------- */
        handleSlideView: (state, action: PayloadAction<SideFilmStripProps['slideView']>) => {
            const status = action.payload as 'on' | 'off';

            state.slideView = status;
        }
    }
});


/* =====================================================================
    Types.
===================================================================== */
export interface SideFilmStripProps {
    [index: string]: ImageDocTypes | number | null | 'on' | 'off' | undefined,
    enlargeDoc: ImageDocTypes | null,
    docIndex: number | null,
    slideView?: 'on' | 'off'
};


// Selector for selection state.
export const sideFilmStrip = (state: RootState) => state.sideFilmStrip;

// Export actions, reducers.
const { actions, reducer } = sideFilmStripSlice;
export const { handleEnlarger, handleSlideView } = actions;
export default reducer;