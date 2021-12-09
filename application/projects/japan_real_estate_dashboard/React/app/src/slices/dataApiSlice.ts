import { createSlice, createAsyncThunk, } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';
import { RootState } from '../store';
import { DEV_MODE } from '../App';



/* --------------------------------------
    API for fetching data from MongoDB.
    Handles updates to {data} state.
-------------------------------------- */

export const mongoDbFetchData = createAsyncThunk(
    /* ---------------------------------------------------------------
        Async thunk for fetching sales data based on chosen options.
    --------------------------------------------------------------- */
    'dataApi/fetchData',
    async (requestParam: MongoDbDataApiFetchProps) => {// requestParam from SidebarOptions' dispatched action.
        const apiUrl: string = DEV_MODE === 'True'
            ? process.env.REACT_APP_API_DATA_DEV!
            : process.env.REACT_APP_API_DATA!;

        // Async fetch requested data, calling backend API to MongoDB.
        try {
            const response: AxiosResponse = await fetchData(apiUrl, requestParam);
               
            if (response.status === 200) {
                // Returns promise status, caught and handled by extra reducers in dataSlice. 
                // if (DEV_MODE === 'True')
                //     console.log("SUCCESS: Data API called.", response);
                return (await response.data);
            }
        } catch (error) {
            if (axios.isAxiosError(error.response)) {
                console.log("ERROR: AxiosError - Data API fetch.", error.response.data.error)
            } else {
                console.log("ERROR: API call failed on data fetch.", error);
            }
        }
    }
);


export const fetchData = (apiUrl: string, requestParam: object) => {
    /* -----------------------------
        MongoDB fetcher for thunk.
    ------------------------------*/
    let mongoDbPromise = Promise.resolve(axios.get(apiUrl, {params: requestParam}));
    return mongoDbPromise;
}


// State for initial render.
const initialState: DataApiProps = {
    currentOptions: {
        collection: '',
        options: '',
        rawInput: {
            buildingType: '',
            stationDist: '',
            material: '',
            age: '',
            floorArea: ''
        }
    },
    collections: {}
}


const dataApiSlice = createSlice({
    /* ----------------------------------------------
        Slice that handles updates to {data} state.
    ---------------------------------------------- */
    name: 'dataApi',
    initialState,
    reducers: {
        handleRawInput: (state, action) => {
            /* ------------------------------------------
                Saves submitted option values to state.
            ------------------------------------------ */
            const collection = action.payload.collection;
            const options = action.payload.options;
            const rawInput = action.payload.rawInput;
            
            state.currentOptions.collection = collection;
            state.currentOptions.options = options;
            state.currentOptions.rawInput = rawInput;
        }
    },
    extraReducers: (builder) => {
        /* ----------------------------------------------
            Reducers for async thunk MongoDB API calls.
        ---------------------------------------------- */
        builder
            .addCase(mongoDbFetchData.fulfilled, (state, action) => {
                /* ------------------------------------- 
                    Updates state on successful fetch.
                ------------------------------------- */
                let payloadCollection: string = '';
                let payloadOptions: string = '';


                // Save call parameters.
                for (let [key, val] of Object.entries(action.meta.arg)) {
                    if (key === 'collection') {
                        payloadCollection = val;
                    } else if (key === 'options') {
                        payloadOptions = val;
                    }
                }

                // Update data state.
                state.currentOptions.collection = payloadCollection;
                state.currentOptions.options = payloadOptions;
                state.collections = {
                    ...state.collections, 
                    [payloadCollection]: {
                        ...state.collections[payloadCollection],
                        [payloadOptions]: action.payload[0]
                    }
                }
            })

            .addCase(mongoDbFetchData.pending, (state, action) => {
                // Do nothing.
            })

            .addCase(mongoDbFetchData.rejected, (state, action) => {
                /* ------------------------ 
                    Catches fetch errors.
                ------------------------ */
                console.error("MongoDB data fetch unsuccessful.", action);
            })
    }
});


// Types setting.
export interface DataApiProps {
    [index: string]: string | any,
    currentOptions: CurrentProps,
    collections: {
        [index: string]: string | any
    }
}

type CurrentProps = {
    [index: string]: string | any,
    collection: string,
    options: string,
    rawInput: {
        [index: string]: string | any,
        buildingType: string,
        stationDist: string,
        material: string,
        age: string,
        floorArea: string
    }
}

export type MongoDbDataApiFetchProps = {
    [index: string]: string | any,
    lang: 'en' | 'jp',
    collection: string,
    options: string
}


// Selector for data api state.
export const selectDataApi = (state: RootState) => state.dataApi; 

// Export actions, reducers.
const { actions, reducer } = dataApiSlice;
export const { handleRawInput } = actions;
export default reducer;
