import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';



/* ----------------------------------------------
    Slice for setting the language used in app.
    Handles {language} state.
---------------------------------------------- */

// State for initial render.
const initialState: LanguageProps = {
   en: false,
   jp: false,
   loaded: false
}


const languageSlice = createSlice({
    /* -------------------------------------------
        Handles saving of language based on URL.
    ------------------------------------------- */
    name: 'language',
    initialState,
    reducers: {
        handleLanguage: (state, action) => {
            /* --------------------------
                Save language to state.
            -------------------------- */
            const name = Object.keys(action.payload)[0];
            const value = Object.values(action.payload)[0];

            state[name] = value;
            state.loaded = true
        }
    }
});


// Types setting.
export interface LanguageProps {
    [index: string]: string | any,
    en: boolean,
    jp: boolean,
    loaded: boolean
}

export type LocaleProps = {
    [index: string]: string | any,
    lang: 'en' | 'jp',
}

// Selector for selection state.
export const selectSliders = (state: RootState) => state.language;

// Export actions, reducers.
const { actions, reducer } = languageSlice;
export const { handleLanguage } = actions;
export default reducer;
