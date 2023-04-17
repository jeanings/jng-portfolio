import { 
    createSlice, 
    createAsyncThunk,
    Action,
    AnyAction } from '@reduxjs/toolkit';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { RootState } from '../../app/store';
import { apiUrl } from '../../app/App';
import { getCookie } from '../Login/loginSlice';


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
            parsedRequest[parameter] = request[parameter];
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
            });

            parsedRequest[parameter] = parsedArrayToString;
        }
    }

    // Attach session cookies.
    const headers = {
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
    };

    const mongoDbPromise = Promise.resolve(
        axios({
            method: 'get',
            url: apiUrl,
            headers: headers,
            params: parsedRequest,
            withCredentials: true
        })
    );
    
    return mongoDbPromise;
};


/* ------------------------------------------
    Handles updates to timeline selection.
------------------------------------------ */
// State for initial render.
const initialState: TimelineProps = {
    responseStatus: 'uninitialized',
    query: null,
    initYear: null,
    selected: {
        year: null,
        month: 'all'
    },
    years: null,
    counter: {
        'all': 0,   // For actual counts.
        'jan': 0, 'feb': 0, 'mar': 0,
        'apr': 0, 'may': 0, 'jun': 0,
        'jul': 0, 'aug': 0, 'sep': 0,
        'oct': 0, 'nov': 0, 'dec': 0,
        'previous': {
            'all': 0,   // For visual rolling counter.
            'jan': 0, 'feb': 0, 'mar': 0,
            'apr': 0, 'may': 0, 'jun': 0,
            'jul': 0, 'aug': 0, 'sep': 0,
            'oct': 0, 'nov': 0, 'dec': 0,
        }
    },
    imageDocs: null,
    filterSelectables: null,
    filteredSelectables: null,
    geojson: null,
    bounds: null
};

const timelineSlice = createSlice({
    name: 'timeline',
    initialState,
    reducers: {
        /* -------------------------------------------------
            Handles setting request after app initialized.
        ------------------------------------------------- */
        handleResponseStatus: (state, action) => {
            const responseStatus = action.payload;
            state.responseStatus = responseStatus;
        },
        /* ----------------------------------------------------------
            Handles year selection for style, attribute updates.
            << year >> triggers fetch useEffect,
            << month >> resetting to 'all' triggers fetch useEffect.
        ---------------------------------------------------------- */
        handleYearSelect: (state, action) => {
            const selectedYear = action.payload;
            state.selected.year = selectedYear;
            state.selected.month = 'all';
        },
        /* --------------------------------------------------------
            Handles month selection for style, attribute updates.
            << month >> setting triggers fetch useEffect.
        -------------------------------------------------------- */
        handleMonthSelect: (state, action) => {
            const selectedMonth = action.payload;
            state.selected.month = selectedMonth;
        },
        /* --------------------------------------------
            Handles storing previous counter to start 
            rolling counter from.
        -------------------------------------------- */
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
                const args = action.meta.arg;
                const years: Array<string> = data.years;
                const counter: CounterTypes = data.counter;
                const filterSelectables: FilterableTypes = data.filterSelectables[0];
                const filteredSelectables: FilterableTypes = data.filteredSelectables;
                const imageDocs: Array<ImageDocTypes> = data.docs;
                const geojsonFeatures: GeojsonFeatureCollectionProps = data.featureCollection;
                const bbox: BboxType = data.bounds;

                /* ----------------------------
                    Set << timeline >> states.
                ---------------------------- */
                state.query = args;

                // Assigning year-related states on init.
                if (state.initYear === null) {
                    const initYear: number = args.year !== 'default'
                        ? args.year                     // Sets to year of fetch request
                        : imageDocs[0].date.year        // Sets to year of image docs if 'default'
                    state.initYear = initYear;
                    state.selected.year = initYear;
                    state.responseStatus = 'initialized';
                }
                else {
                    state.responseStatus = 'successful';
                }
    
                // Assign list of years in the collection.
                state.years = years;
                
                // For non-month queries, update counter and clear filteredSelectables.
                if (args['month'] === undefined) {
                    state.counter = {...counter, 'previous': state.counter.previous};
                    state.filteredSelectables = null;
                }
                // Only assign filteredSelectables if year-month query.
                else if (Object.keys(args).length === 2 
                    && args['month'] !== undefined) {
                    state.filteredSelectables = filteredSelectables;
                }
                
                // Set main selectables only on single 'year' queries.
                if (Object.keys(args).length === 1) {
                    state.filterSelectables = filterSelectables;
                }

                // Sort docs by descending order.
                let sortedDocs = [...imageDocs];
                sortedDocs.sort((a, b) => {
                    const idA = a._id;
                    const idB = b._id;

                    // Sort using docs' _id, based on insertion time, 
                    // which in turn is based on date taken or filename.
                    switch(true) {
                        case idA < idB:
                            return 1;
                        case idA > idB:
                            return -1;
                        default:
                            return 0;
                    }
                });

                state.imageDocs = sortedDocs;
                state.geojson = geojsonFeatures;
                state.bounds = bbox;
            })
            /* --------------------------------------- 
                Catches errors on fetching from API.
            --------------------------------------- */
            .addMatcher(isRejectedAction, (state, action) => {
                // MongoDB image data action rejected.
                state.responseStatus = 'error';
            })
    },
});


/* =====================================================================
    Types.
===================================================================== */
export interface TimelineProps {
    [index: string]: string | any,
    'responseStatus': 'uninitialized' | 'initialized' | 'pending' | 'successful' | 'error',
    'query': ImageDocsRequestProps | null,
    'initYear': number | null,
    'selected': {
        'year': number | null,
        'month': string | null
    },
    'years': Array<string | number> | null,
    'counter': CounterTypes,
    'imageDocs': Array<ImageDocTypes> | null,
    'filterSelectables': FilterableTypes | null,
    'filteredSelectables': FilterableTypes | null, 
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

export interface CounterTypes {
    [index: string]: number | object,
    'previous': {
        [index: string]: number | null
    }
};

export interface ImageDocTypes {
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
    'url': string,
    'url_thumb': string,
    'owner': string
};

export interface ImageDocFormatTypes {
    'medium': 'digital' | 'film' | string,
    'type': '120' | '35mm' | 'APS-C' | 'Micro43' | 'Full-frame' | string
};

export interface FilterableTypes {
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

export interface GeojsonFeatureType {
    [index: string]: string | object,
    'type': string,
    'geometry': {
        'type': string,
        'coordinates': Array<number>
    },
    'properties': {
        'doc_id': string,
        'name': string,
        'date': {
            'year': number,
            'month': number
        }
    }
};

export interface BboxType {
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
export const { 
    handleYearSelect, 
    handleMonthSelect, 
    handleMonthCounter,
    handleResponseStatus } = actions;
export default reducer;
