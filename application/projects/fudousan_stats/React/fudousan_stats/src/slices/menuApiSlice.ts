import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { RootState } from '../store';



// Async thunk for fetching default plain regions hierarchy data.
export const mongoDbFetchRegions = createAsyncThunk(
    'menuApi/fetchRegions',
    async (requestParam: object) => {// requestParam from CreateRegion's dispatched action.
        // const apiUrl: string = 'http://localhost:5000/projects/fudousan-stats/get-menu?';    // for development use
        const apiUrl = 'https://jeanings.space/projects/fudousan-stats/get-menu?';              // for GAE deployment

        
        // Async fetch requested data, calling backend API to MongoDB.
        try {
            const response: AxiosResponse = await fetchDb(apiUrl, requestParam);

            if (response.status === 200) {
                // Returns promise status, caught and handled by extra reducers in menuSlice. 
                // console.log("SUCCESS: mongoDbFetchRegions called.", response);
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
const initialState: MenuApiProps = {
    status: 'awaiting',
    regions: {},
    prefectures: {},
    cities: {},
    districts: {}
}



// Create MongoDB dynamic menu slice.
const menuApiSlice = createSlice({
    name: 'menuApi',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Reducers for async thunk MongoDB API call.
        builder
            // Default regions hierarchy call.
            .addCase(mongoDbFetchRegions.fulfilled, (state, action) => {
                // Handle state updates depending on initial render status.
                const category = Object.keys(action.meta.arg)[0];

                if (state.status != 'successful') {
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
                    // Set render status.
                    state.status = 'successful';
                } else if (state.status === 'successful') {
                    let newCategory: string;
                    const categoryMap = {
                        'regions': 'prefectures',
                        'prefectures': 'cities',
                        'cities': 'districts'
                    }
                    
                    // Assign next category corresponding to 'parent' category.
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
                // Don't change status, breaks api call for some reason.
            })

            .addCase(mongoDbFetchRegions.rejected, (state, action) => {
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

// type MongoObjectInitProps = Record<CategoryKeys, MongoObjectKeyVal>;
// type MongoObjectProps = Record<CategoryKeys, MongoObjectKeyVal>;

// Selector for menu state.
export const selectMenu = (state: RootState) => state.menuApi; 

// Export actions, reducers.
const { actions, reducer } = menuApiSlice;
export const { } = actions;
export default reducer;