import { 
    createSlice, 
    createAsyncThunk,
    Action,
    AnyAction,
    PayloadAction, 
    isRejectedWithValue } from '@reduxjs/toolkit';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { RootState } from '../../app/store';
import { DEV_MODE, apiUrl } from '../../app/App';


/* ==============================================================================
    Slice for handling current selection of timeline; year and month.
    Handles updates to {dateSelection} state.
============================================================================== */

/* -------------------------------------------------
    Async thunk for fetching initial MongoDB data.
------------------------------------------------- */
export const fetchImagesData = createAsyncThunk(
    'timeline/fetchImagesData',
    async (request: ImageDocsRequestProps, { rejectWithValue }) => {
        // Async fetch requested data, calling backend API to MongoDB.
        try {
            const response: AxiosResponse = await fetchDocs(apiUrl, request);
            if (response.status === 200) {
                // Returns promise status, handling done by extra reducer.
                return (await response.data);
            }
        } 
        catch (err) {
            // Errors handled by extra reducer.
            if (axios.isAxiosError(err)) {
                const error = err as AxiosError;
                return rejectWithValue(error.response!.data);
            }
            else {
                const error = err;
                return rejectWithValue(error);
            }
        }
    }
);


/* --------------------------------
    Image docs fetcher for thunk.
-------------------------------- */
export const fetchDocs = (apiUrl: string, request: ImageDocsRequestProps) => {
    
   const mongoDbPromise = Promise.resolve(
        axios.get(
            apiUrl, { params: request }
        )
    );

    return mongoDbPromise;
}


/* ------------------------------------------
    Handles updates to timeline selection.
------------------------------------------ */
// State for initial render.
const initialState: TimelineProps = {
    request: 'idle',
    yearInit: null,
    yearSelected: null,
    years: null,
    month: 'all',
    counter: null,
    imageDocs: null,
    filterSelectables: null
};

const timelineSlice = createSlice({
    name: 'timeline',
    initialState,
    reducers: {
        /* ---------------------------
            Saves selection of year.
        --------------------------- */
        // handleTimelineYear: (state, action: PayloadAction<TimelineProps['year']>) => {
        //     const selectedYear: number = action.payload;
        //     state.yearSelected = selectedYear;
        //     state.request = 'pending';
        // },
        /* ------------------------------
            Saves selection of month(s)
        ------------------------------ */
        handleTimelineMonth: (state, action: PayloadAction<TimelineProps['month']>) => {
            const selectedMonth = action.payload;
            state.month = selectedMonth;
        }
    },
    /* ----------------------------------------------------
        Reducers for async thunk MongoDB menu API calls.
    ---------------------------------------------------- */
    extraReducers: (builder) => {
        builder
            /* ------------------------------------- 
                Updates state on successful fetch.
            ------------------------------------- */
            .addCase(fetchImagesData.fulfilled, (state, action) => {
                const data = action.payload;
                const counter: CounterTypes = data.counter;
                const filterSelectables: FilterableTypes = data.filterSelectables[0];
                const imageDocs: Array<ImageDocTypes> = data.docs;
                const years: Array<string> = data.years
                
                // Set states.
                if (state.yearInit === null) {
                    const yearInit: number = action.meta.arg.year !== 'default'
                        ? action.meta.arg.year          // sets to year of fetch request
                        : imageDocs[0].date.year        // sets to year of image docs if default
                    state.yearInit = yearInit;
                    state.yearSelected = yearInit;
                }
                else {
                    state.yearSelected = action.meta.arg.year as number;
                }
                state.years = years;
                state.counter = counter;
                state.imageDocs = imageDocs;
                state.filterSelectables = filterSelectables;
                state.request = 'complete';
            })
            /* --------------------------------------- 
                Catches errors on fetching from API.
            --------------------------------------- */
            .addMatcher(isRejectedAction, (state, action) => {
                // console.log("MongoDB image data action rejected.");
                state.request = 'error';
            })
    },
});


// Types setting.
export interface TimelineProps {
    [index: string]: string | any,
    'request': 'idle' | 'pending' | 'complete' | 'error',
    'yearInit': number | null,
    'yearSelected': number | null,
    'years': Array<string> | null,
    'month': TimelineMonthTypes,
    'counter': CounterTypes | null,
    'imageDocs': Array<ImageDocTypes> | null,
    'filterSelectables': FilterableTypes | null
};

export interface ImageDocsRequestProps {
    [index: string]: string | any,
    'year': number | 'default',
    'month'?: number | null,
    'format-medium'?: Array<ImageDocFormatTypes['medium']> | null,
    'format-type'?: Array<ImageDocFormatTypes['type']> | null,
    'film'?: Array<string> | null,
    'camera'?: Array<string> | null,
    'lenses'?: Array<string> | null,
    'focal-length'?: Array<number> | null,
    'tags'?: Array<string> | null
};

export type TimelineMonthTypes = 
    'jan' | 'feb' | 'mar' |
    'apr' | 'may' | 'jun' |
    'jul' | 'aug' | 'sep' |
    'oct' | 'nov' | 'dec' |
    'all';

export type CounterTypes = {
    [index: string]: number
};

export type ImageDocTypes = {
    '_id': string,
    'aperture': number | null,
    'date':  {
        'year': number,
        'month': number,
        'day': number | null,
        'time': string | null,
        'taken': string | null,
    },
    'description': string | null,
    'filename': string,
    'film': string | null,
    'focal_length_35mm': number,
    'format': ImageDocFormatTypes,
    'gps': {
        'lat': number,
        'lat_ref': string | null,
        'lng': number,
        'lng_ref': string | null
    },
    'iso': number,
    'lens': string,
    'make': string,
    'model': string,
    'shutter_speed': number | null,
    'tags': Array<string>,
    'title': string | null,
    'url': string
};

export type ImageDocFormatTypes = {
    'medium': 'digital' | 'film',
    'type': '120' | '35mm' | 'APS-C' | 'Micro43' | 'Full-frame'
};

export type FilterableTypes = {
    'camera': Array<string>,
    'film'?: Array<string>,
    'focalLength': Array<number>,
    'formatMedium': Array<string>,
    'formatType': Array<string>,
    'lenses': Array<string>,
    'tags': Array<string>
};

interface RejectedAction extends Action {
    error: Error
};
  
function isRejectedAction(action: AnyAction): action is RejectedAction {
    return action.type.endsWith('rejected');
};

// Selector for selection state.
export const timelineSelection = (state: RootState) => state.timeline;

// Export actions, reducers.
const { actions, reducer } = timelineSlice;
export const { handleTimelineMonth } = actions;
export default reducer;
