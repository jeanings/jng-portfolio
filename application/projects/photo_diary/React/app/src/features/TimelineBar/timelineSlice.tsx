import { 
    createSlice, 
    createAsyncThunk,
    Action,
    AnyAction,
    PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { RootState } from '../../app/store';
import { DEV_MODE, apiUrl } from '../../app/App';


/* ==============================================================================
    Slice for handling current selection of timeline; year and month.
    Handles updates to {dateSelection} state.
============================================================================== */
export const fetchImagesData = createAsyncThunk(
    /* -------------------------------------------------
        Async thunk for fetching initial MongoDB data.
    ------------------------------------------------- */
    'timeline/fetchImagesData',
    async (request: ImageDocsRequestProps) => {
        // Async fetch requested data, calling backend API to MongoDB.
        try {
            const response: AxiosResponse = await fetchDocs(apiUrl, request);
            if (response.status === 200) {
                // Returns promise status, handling done by extra reducers in timelineSlice.
                return (await response.data);
            }
        } 
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.log("ERROR: AxiosError - async thunk in fetchImages.", error.response?.data)
            } else {
                console.log("ERROR: API call failed in fetchImages.");
            }
        }
    }
);


export const fetchDocs = (apiUrl: string, request: ImageDocsRequestProps) => {
    /* --------------------------------
        Image docs fetcher for thunk.
    -------------------------------- */
    const mongoDbPromise = Promise.resolve(
        axios.get(
            apiUrl, { params: request }
        )
    );

    return mongoDbPromise;
}


// State for initial render.
const initialState: TimelineProps = {
    request: 'idle',
    year: null,
    years: null,
    month: 'all',
    counter: null,
    imageDocs: null,
    filterSelectables: null
};


const timelineSlice = createSlice({
    /* ---------------------------------------------
        Handles updates to timeline selection.
    --------------------------------------------- */
    name: 'timeline',
    initialState,
    reducers: {
        handleTimelineYear: (state, action: PayloadAction<TimelineProps['year']>) => {
            /* --------------------------
                Saves selection of year.
            -------------------------- */
            const selectedYear = action.payload;
            
            state.year = selectedYear;
        },
        handleTimelineMonth: (state, action: PayloadAction<TimelineProps['month']>) => {
            /* -----------------------------
                Saves selection of month(s)
            ------------------------------ */
            const selectedMonth = action.payload;

            state.month = selectedMonth;
        }
    },
    extraReducers: (builder) => {
        /* ----------------------------------------------------
            Reducers for async thunk MongoDB menu API calls.
        ---------------------------------------------------- */
        builder
            .addCase(fetchImagesData.fulfilled, (state, action) => {
                /* ------------------------------------- 
                    Updates state on successful fetch.
                ------------------------------------- */
                const data = action.payload
                const counter: object = data.counter;
                const filterSelectables: FilterableTypes = data.filterSelectables[0];
                const imageDocs: Array<ImageDocTypes> = data.docs;
                const years: Array<string> = data.years
                const year: number = action.meta.arg.year != 'default'
                    ? action.meta.arg.year
                    : imageDocs[0].date.year
                
                // Set states.
                state.request = 'complete';
                state.year = year;
                state.years = years;
                state.counter = counter;
                state.imageDocs = imageDocs;
                state.filterSelectables = filterSelectables;
            })

            .addCase(fetchImagesData.rejected, (state, action) => {
                /* ------------------------ 
                    Catches fetch errors.
                ------------------------ */
                state.request = 'error';
                console.error("MongoDB image data fetch unsuccessful.", action);
            })

            .addMatcher(isRejectedAction, (state, action) => {
                console.error("MongoDB image data action rejected.", action);
            })
    },
});


// Types setting.
export interface TimelineProps {
    [index: string]: string | any,
    'request': 'idle' | 'pending' | 'complete' | 'error',
    'year': number | null,
    'years': Array<string> | null,
    'month': TimelineMonthTypes,
    'counter': object | null,
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
export const { handleTimelineYear, handleTimelineMonth } = actions;
export default reducer;
