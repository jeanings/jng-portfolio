import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';
import { RootState } from '../store';
import { MapboxGeocoderProps } from '../containers/DashboardMap';



export const mapboxFetchGeo = createAsyncThunk(
    /* -------------------------------------------------- 
        Async thunk for fetching Mapbox geocoder data.
    -------------------------------------------------- */
    'map/fetchGeo',
    async (requestGeo: MapboxGeocoderProps) => {
        const apiUrl: string = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
        
        try {
            const response: AxiosResponse = await fetchGeo(apiUrl, requestGeo);

            if (response.status === 200) {
                // Returns promise status, caught and handled by extra reducers in mapSlice. 
                // console.log("SUCCESS: mapboxFetchGeo called.", response);
                return (await response.data);
            } else {
                console.log("ERROR: mapboxFetchGeo response failed.", response);
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



export const fetchGeo = (apiUrl: string, requestGeo: MapboxGeocoderProps) => {
    /* ------------------------------
        Helper: fetcher for thunk.
    ------------------------------ */
    const accessToken = process.env.REACT_APP_DEV_MAPBOX as string;
    // const type: string = '&types=' + requestGeo.types;   // Including type returns poor results
    const country: string = '&country=jp';
    const language: string = '&language=ja';
    const worldview: string = '&worldview=jp';
    const resultsLimit: string = '&limit=' + '1';

    const settings: string = '.json?access_token='.concat(
        accessToken, 
        country, 
        language, 
        worldview, 
        resultsLimit
    );

    const requestUrl: string = apiUrl.concat(
        requestGeo.partOf,
        requestGeo.name,
        settings
    );
        
    let geocoderPromise = Promise.resolve(axios.get(requestUrl));

    return geocoderPromise;
}


// State for initial render.
const initialState: MapProps = {
    lng: 137.57,
    lat: 35.91,
    zoom: 4.35,
    bounds: {
        ne: {lng: 151.1719, lat: 46.3044},
        sw: {lng: 123.9681, lat: 23.9492}
    }
}


const mapSlice = createSlice({
    /* -------------------------------------------------------
        Slice to handle bounds and coordinates updating for
        interactive map actions on menu item clicks.
    ------------------------------------------------------- */
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
            const newBounds: BoundsProps = action.payload;
            state.bounds = newBounds;
        }
    },
    extraReducers: (builder) => {
        // Reducers for async thunk Mapbox Geocoder API call.
        builder
            .addCase(mapboxFetchGeo.fulfilled, (state, action) => {
                const geoData = action.payload.features[0];
                let sameSwLng: boolean;
                let sameNeLat: boolean;
                let unchanged: boolean;

                // Check if bounding box is the same as previous.
                if (geoData.bbox !== undefined) {
                    sameSwLng = state.bounds.sw.lng === geoData.bbox[0] ? true : false;
                    sameNeLat = state.bounds.ne.lng === geoData.bbox[3] ? true : false;
                } else {
                    [sameSwLng, sameNeLat] = [false, false];
                }
                unchanged = sameSwLng === true || sameNeLat === true ? true : false;

                // Update bounds (non-districts) or coordinates (districts).
                if (geoData.bbox !== undefined && unchanged === false) {
                    // Not used; update just for debugging / completeness.
                    [state.lng, state.lat] = geoData.center;
                    state.zoom = null;

                    // Update bounding box coords (exception: districts).
                    [state.bounds.sw.lng, state.bounds.sw.lat,
                        state.bounds.ne.lng, state.bounds.ne.lat] = geoData.bbox;
                } else {
                    // Update lng lat centres.
                    // (Mapbox free tier doesn't provide such tight local boundaries)
                    [state.lng, state.lat] = geoData.center;
                    state.zoom = 15;     // Arbitrary zoom level
                    
                    // Remove bounding box since it's not provided. 
                    [state.bounds.sw.lng, state.bounds.sw.lat,
                        state.bounds.ne.lng, state.bounds.ne.lat] = [null, null, null, null];
                }
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
    zoom: number | null,
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