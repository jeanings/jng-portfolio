import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { RootState } from '../store';



// Async thunk for fetching sales data based on chosen options.
export const mongoDbFetchData = createAsyncThunk(
    'data/fetchData',
    async (requestParam: object) => {// requestParam from SidebarOptions' dispatched action.
        // const apiUrl: string = 'http://localhost:5000/projects/fudousan-stats/get-data?';    // for development use
        const apiUrl = 'https://jeanings.space/projects/fudousan-stats/get-data?';              // for GAE deployment

        // Async fetch requested data, calling backend API to MongoDB.
        try {
            const response: AxiosResponse = await fetchDb(apiUrl, requestParam);
               
            if (response.status === 200) {
                // Returns promise status, caught and handled by extra reducers in dataSlice. 
                // console.log("SUCCESS: mongoDbFetchData called.", response);
                return (await response.data);
            }
        } catch (error) {
            if (axios.isAxiosError(error.response)) {
                console.log("ERROR: AxiosError, front/backend initial render.", error.response.data.error)
            } else {
                console.log("ERROR: Front/backend issue on initial render.", error);
            }
        }
    }
);



// Fetch helper function.
export const fetchDb = (apiUrl: string, requestParam: object) => {
    let mongoDbPromise = Promise.resolve(axios.get(apiUrl, {params: requestParam}));
    return mongoDbPromise;
}



// State for initial render.
const initialState: DataProps = {
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



// Create MongoDB dyanmic menu slice.
const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        handleRawInput: (state, action) => {
            const collection = action.payload.collection;
            const options = action.payload.options;
            const rawInput = action.payload.rawInput;
            console.log('handleRawInput', action.payload);
            // Update state.
            state.currentOptions.collection = collection;
            state.currentOptions.options = options;
            state.currentOptions.rawInput = rawInput;
        }
    },
    extraReducers: (builder) => {
        // Reducers for async thunk MongoDB API call.
        builder
            // Sales data call.
            .addCase(mongoDbFetchData.fulfilled, (state, action) => {
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
                console.error("MongoDB data fetch unsuccessful.", action);
            })
    }
});


// Types setting.
export interface DataProps {
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


// Selector for menu state.
export const selectData = (state: RootState) => state.data; 

// Export actions, reducers.
const { actions, reducer } = dataSlice;
export const { handleRawInput } = actions;
export default reducer;