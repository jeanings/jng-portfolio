import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { RootState } from '../store';
import { DEV_MODE } from '../App';



/* -------------------------------------------------------------
    API for fetching regional heirarchy data for regions menu.
    Handles updates to {menuApi}.
------------------------------------------------------------- */

export const mongoDbFetchRegions = createAsyncThunk(
    /* -----------------------------------------------------------
        Async thunk for fetching default regions hierarchy data.
    ----------------------------------------------------------- */
    'menuApi/fetchRegions',
    async (requestParam: MongoDbMenuFetchProps) => {// requestParam from CreateRegion's dispatched action.
        const apiUrl: string = DEV_MODE === 'True'
            ? process.env.REACT_APP_API_MENU_DEV!
            : process.env.REACT_APP_API_MENU!;

        // Async fetch requested data, calling backend API to MongoDB.
        try {
            const response: AxiosResponse = await fetchMenu(apiUrl, requestParam);

            if (response.status === 200) {
                // Returns promise status, caught and handled by extra reducers in menuSlice. 
                // if (DEV_MODE === 'True')
                //     console.log("SUCCESS: Menu API called.", response);
                return (await response.data);
            }
        } catch (error) {
            if (axios.isAxiosError(error.response)) {
                console.log("ERROR: AxiosError - Menu API fetch.", error.response.data.error)
            } else {
                console.log("ERROR: API call failed on menu fetch.", error);
            }
        }
    }
);


export const fetchMenu = (apiUrl: string, requestParam: object) => {
    /* ---------------------------------------------
        Regions hierarchy names fetcher for thunk.
    --------------------------------------------- */
    let mongoDbPromise = Promise.resolve(axios.get(apiUrl, {params: requestParam}));
    return mongoDbPromise;
}


// State for initial render.
const initialState: MenuApiProps = {
    status: 'awaiting',
    regions: {},
    prefectures: {},
    cities: {},
    districts: {}
}


const menuApiSlice = createSlice({
    /* ------------------------------------------------------------------
        Slice that handles fetching names of areas under regional type.
    ------------------------------------------------------------------ */
    name: 'menuApi',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        /* ----------------------------------------------------
            Reducers for async thunk MongoDB menu API calls.
        ---------------------------------------------------- */
        builder
            .addCase(mongoDbFetchRegions.fulfilled, (state, action) => {
                /* ------------------------------------- 
                    Updates state on successful fetch.
                ------------------------------------- */
                const category = Object.keys(action.meta.arg)[1];
                // Handle state updates depending on initial render status.
                if (state.status !== 'successful') {
                    // Push each object in payload array into menu state.
                    action.payload.map((item: any) => {
                        if (category === 'country') {
                            state.regions = {
                                ...state.regions,
                                [item.regions.name]: [
                                    {
                                        name: item.regions.name,
                                        _id: item.regions._id
                                    }
                                ]
                            }
                        }
                    });

                    // Set fetch status.
                    state.status = 'successful';

                } else if (state.status === 'successful') {
                    const categoryMap = {
                        'regions': 'prefectures',
                        'prefectures': 'cities',
                        'cities': 'districts'
                    }
                    
                    // Assign next category corresponding to 'parent' category.
                    let newCategory: string;
                    for (let [key, value] of Object.entries(categoryMap)) {
                        if (category == key) {
                            newCategory = value;
                        }
                    }

                    // Create new object under new category.
                    action.payload.map((item: any) => {
                        if (!state[newCategory][item._id.partOf]) {
                            state[newCategory] = {
                                [item._id.partOf]: []
                            }
                        }

                        const tempObj: MongoObjectKeyVal = {
                            name: item._id.name,
                            order: item._id.order,
                            count: item._id.count,
                            _id: item._id._id
                        }

                        // Populate new category with MongoDB data.
                        state[newCategory][item._id.partOf].push(tempObj);
                    });
                }
            })

            .addCase(mongoDbFetchRegions.pending, (state, action) => {
                // Don't change status, breaks api call.
            })

            .addCase(mongoDbFetchRegions.rejected, (state, action) => {
                /* ------------------------ 
                    Catches fetch errors.
                ------------------------ */
                state.status = 'unsuccessful';
                console.error("MongoDB menu fetch unsuccessful.", action);
            })
    }
});


// Types setting.
export interface MenuApiProps {
    [index: string]: string | any,
    status: 'awaiting' | 'pending' | 'successful' | 'unsuccessful',
    regions: any,
    prefectures: any,
    cities: any,
    districts: any
}

export type MongoObjectKeyVal = {
    name: string,
    _id: string,
    partOf?: string,
    order?: number,
    count?: number
}

export type MongoDbMenuFetchProps = {
    [index: string]: string | any,
    lang: 'en' | 'jp' | 'dev',
    country?: string,
    region?: string,
    prefecture?: string,
    city?: string
}

// Selector for menu state.
export const selectMenu = (state: RootState) => state.menuApi; 

// Export actions, reducers.
const { actions, reducer } = menuApiSlice;
export const { } = actions;
export default reducer;
