import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';
import { RootState } from '../store';
import { MapboxGeocoderProps } from '../containers/DashboardMap';



// Async thunk for fetching Mapbox geocoder data.
export const mapboxFetchGeo = createAsyncThunk(
    'map/fetchGeo',
    async (requestGeo: MapboxGeocoderProps) => {
        const apiUrl: string = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
        try {
            const response: AxiosResponse = await fetchGeo(apiUrl, requestGeo);

            if (response.status === 200) {
                // Returns promise status, caught and handled by extra reducers in mapSlice. 
                // console.log("SUCCESS: mapboxFetchGeo called.", response);
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
export const fetchGeo = (apiUrl: string, requestGeo: MapboxGeocoderProps) => {
    const accessToken = process.env.REACT_APP_DEV_MAPBOX as string;
    const type: string = '&types=' + requestGeo.types;
    const settings: string = '.json?access_token=' + accessToken + '&country=jp&worldview=jp&language=ja&limit=1';
    const requestUrl: string = apiUrl.concat(
        requestGeo.partOf, requestGeo.name, settings    // No type, bad results due to complicated regional typing.
    );
        
    let geocoderPromise = Promise.resolve(axios.get(requestUrl));
    return geocoderPromise;
}


// State for initial render.
const initialState: MapProps = {
    lng: 137.89,
    lat: 38.43,
    zoom: 4.75,
    bounds: {
        ne: {lng: null, lat: null},
        sw: {lng: null, lat: null}
    }
}

// Create selection slice.
const mapSlice = createSlice({
    name: 'map',
    initialState,
    reducers: {
        // Initialize map only once.
        handleMapInit: (state, action) => {
            const loadStatus: boolean = action.payload;
            state.loaded = loadStatus;
        },
        // Update bounding coords for region change.
        handleBoundsUpdate: (state, action) => {
            state.bounds = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
        // Reducers for async thunk Mapbox Geocoder API call.
            .addCase(mapboxFetchGeo.fulfilled, (state, action) => {
                const geoData = action.payload.features[0];

                // Update bounding box coords.
                [state.bounds.sw.lng, state.bounds.sw.lat,
                    state.bounds.ne.lng, state.bounds.ne.lat] = geoData.bbox;
            })

            .addCase(mapboxFetchGeo.pending, (state, action) => {
                // No action.
            })

            .addCase(mapboxFetchGeo.rejected, (state, action) => {
                // Unsuccessful update.
                console.log("Mapbox geocoder API call unsuccessful.")
            })
    }
});


// Types setting.
export interface MapProps {
    [index: string]: string | any,
    lng: number,
    lat: number,
    zoom: number,
    bounds: BoundsProps
}

type BoundsProps = {
    [index: string]: string | any,
    ne: BoundsCoordProps,
    sw: BoundsCoordProps
}

type BoundsCoordProps = {
    [index: string]: string | any,
    lng: number | null,
    lat: number | null
}

// Selector for selection state.
export const mapSelection = (state: RootState) => state.map;

// Export actions, reducers.
const { actions, reducer } = mapSlice;
export const { handleMapInit, handleBoundsUpdate } = actions;
export default reducer;