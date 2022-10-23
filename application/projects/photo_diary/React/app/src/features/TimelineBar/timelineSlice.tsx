import { 
    createSlice, 
    createAsyncThunk,
    Action,
    AnyAction,
    PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { RootState } from '../../app/store';
import { apiUrl } from '../../app/App';


/* ==============================================================================
    Slice for handling current selection of timeline; year and month.
    Handles updates to << timeline >> state.
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
    let parsedRequest: ParsedParametersType = {};

    // Convert arrays of parameters into joined query string. 
    for (let parameter in request) {
        if (typeof request[parameter] !== 'object') {
            parsedRequest[parameter] = request[parameter]
        }
        else {
            let parsedArrayToString: string = '';
            // Join all parameters in each array into one query string.
            // Whitespace converts to '_' and all values in array concatenated with '+'.
            request[parameter].forEach((item: string | number) => {
                let parsed: string;
                if (typeof item === 'string') {
                    parsed = item.replace(/\s/g, '_');
                }
                else {
                    parsed = item.toString();
                }
                parsedArrayToString = parsedArrayToString === ''
                    ? parsed
                    : parsedArrayToString.concat('+', parsed);
            })

            parsedRequest[parameter] = parsedArrayToString;
        }
    }

    const mongoDbPromise = Promise.resolve(
        axios.get(
            apiUrl, { params: parsedRequest }
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
    counter: {
        'all': 0,
        'jan': 0, 'feb': 0, 'mar': 0,
        'apr': 0, 'may': 0, 'jun': 0,
        'jul': 0, 'aug': 0, 'sep': 0,
        'oct': 0, 'nov': 0, 'dec': 0,
        'previous': {
            'all': 0,
            'jan': 0, 'feb': 0, 'mar': 0,
            'apr': 0, 'may': 0, 'jun': 0,
            'jul': 0, 'aug': 0, 'sep': 0,
            'oct': 0, 'nov': 0, 'dec': 0,
        }
    },
    imageDocs: null,
    filterSelectables: null,
    geojson: null,
    bounds: null
};

const timelineSlice = createSlice({
    name: 'timeline',
    initialState,
    reducers: {
        handleTimelineMonth: (state, action: PayloadAction<TimelineProps['month']>) => {
            const selectedMonth = action.payload;
            state.month = selectedMonth;
        },
        handleMonthCounter: (state, action) => {
            const month = action.payload.month;
            const count = action.payload.count;

            state.counter.previous[month] = count;
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
                const years: Array<string> = data.years;
                const geojsonFeatures: GeojsonFeatureCollectionProps = data.featureCollection;
                const bbox: BboxType = data.bounds;

                // Set states.
                if (state.yearInit === null) {
                    const yearInit: number = action.meta.arg.year !== 'default'
                        ? action.meta.arg.year          // Sets to year of fetch request
                        : imageDocs[0].date.year        // Sets to year of image docs if default
                    state.yearInit = yearInit;
                    state.yearSelected = yearInit;
                }
                else {
                    state.yearSelected = imageDocs[0].date.year as number;
                }
                state.years = years;
                state.counter = {...counter, 'previous': state.counter.previous};
                state.imageDocs = imageDocs;
                if (Object.keys(action.meta.arg).length === 1) {    // Only set filter selectables
                    state.filterSelectables = filterSelectables;    // if only 1 arg - ie only 'year'
                }
                state.geojson = geojsonFeatures;
                state.bounds = bbox;
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


/* =====================================================================
    Types.
===================================================================== */
export interface TimelineProps {
    [index: string]: string | any,
    'request': 'idle' | 'pending' | 'complete' | 'error',
    'yearInit': number | null,
    'yearSelected': number | null,
    'years': Array<string> | null,
    'month': TimelineMonthTypes,
    'counter': CounterTypes,
    'imageDocs': Array<ImageDocTypes> | null,
    'filterSelectables': FilterableTypes | null,
    'geojson': GeojsonFeatureCollectionProps | null
    'bounds': BboxType | null
};

export interface ImageDocsRequestProps {
    [index: string]: string | any,
    'year': number | 'default',
    'month'?: number | null,
    'format-medium'?: Array<ImageDocFormatTypes['medium']> | null,
    'format-type'?: Array<ImageDocFormatTypes['type']> | null,
    'film'?: Array<string> | null,
    'camera'?: Array<string> | null,
    'lens'?: Array<string> | null,
    'focal-length'?: Array<number> | null,
    'tags'?: Array<string> | null
};

export type ParsedParametersType = {
    [index: string]: string | number | Array<string>
};

export type TimelineMonthTypes = 
    'jan' | 'feb' | 'mar' |
    'apr' | 'may' | 'jun' |
    'jul' | 'aug' | 'sep' |
    'oct' | 'nov' | 'dec' |
    'all';

export type CounterTypes = {
    [index: string]: number | object,
    'previous': {
        [index: string]: number | null
    }
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
    [index: string]: Array<string | number | null> | undefined,
    'make'?: Array<string>,
    'model'?: Array<string>,
    'camera'?: Array<string>,
    'film'?: Array<string | null>,
    'focalLength'?: Array<number>,
    'formatMedium'?: Array<string>,
    'formatType'?: Array<string>,
    'lens'?: Array<string>,
    'tags'?: Array<string>
};

export interface GeojsonFeatureCollectionProps {
    [index: string]: string | object,
    'type': 'FeatureCollection',
    'features': Array<GeojsonFeatureType>
};

export type GeojsonFeatureType = {
    [index: string]: string | object,
    'type': string,
    'geometry': {
        'type': string,
        'coordinates': Array<number>
    },
    'properties': {
        'name': string,
        'date': {
            'year': number,
            'month': number
        }
    }
};

export type BboxType = {
    [index: string]: Array<number>,
    'lat': Array<number>,
    'lng': Array<number>
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
export const { handleTimelineMonth, handleMonthCounter } = actions;
export default reducer;
