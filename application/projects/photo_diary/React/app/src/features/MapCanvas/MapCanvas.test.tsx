import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import { setupStore, RootState } from '../../app/store';
import { useAppDispatch } from '../../common/hooks';
import { 
    cleanup, 
    render, 
    screen, 
    waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { apiUrl } from '../../app/App';
import '@testing-library/jest-dom';
import mockDefaultData from '../../utils/mockDefaultData.json';
import mock2022Data from '../../utils/mock2022Data.json';
import mock2015Data from '../../utils/mock2015Data.json';
import TimelineBar from '../TimelineBar/TimelineBar';
import { GeojsonFeatureCollectionProps, BboxType } from '../TimelineBar/timelineSlice';
import MapCanvas from './MapCanvas';
import { setStyleLoadStatus, cleanupMarkerSource } from './mapCanvasSlice';
// @ts-ignore
import mapboxgl from 'mapbox-gl'; 
import 'mapbox-gl/dist/mapbox-gl.css';


var mockAxios = new MockAdapter(axios);
var user = userEvent.setup();

beforeEach(() => {
    mockAxios = new MockAdapter(axios);
});

afterEach(() => {
    mockAxios.reset();
    cleanup;
});

/* -------------------------------------------------
    Mocked state.
------------------------------------------------- */
const preloadedState: RootState = {
    timeline: {
        request: 'complete',
        yearInit: 2022,
        yearSelected: 2022,
        years: mockDefaultData.years,
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
        filterSelectables: mockDefaultData.filterSelectables[0],
        geojson: mockDefaultData.featureCollection as GeojsonFeatureCollectionProps,
        bounds: mockDefaultData.bounds as BboxType
    },
    filter: {
        formatMedium: [],
        formatType: [],
        film: [],
        camera: [],
        lens: [],
        focalLength: [],
        tags: []
    },
    mapCanvas: {
        styleLoaded: false,
        sourceStatus: 'idle',
        markersStatus: 'idle'
    }
};

/* -------------------------------------------------
    Mocked Mapbox.
------------------------------------------------- */
jest.mock("mapbox-gl", () => ({
    Map: jest.fn(),
    Popup: jest.fn(),
}));
  
mapboxgl.Map.prototype = {
    on: jest.fn(),
    off: jest.fn(),
    remove: jest.fn(),
    getCanvas: jest.fn(),
    addSource: jest.fn(),
    addLayer: jest.fn(),
    getSource: jest.fn(),
    getLayer: jest.fn(),
    removeSource: jest.fn(),
    removeLayer: jest.fn(),
};

mapboxgl.Popup.prototype = {
    remove: jest.fn(),
};


/* -------------------------------------------------
    Tests on map methods being called on renders.
------------------------------------------------- */
test.only("initializes map on rendering", async() => {
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl, { params: { 'year': 'default' } })
        .replyOnce(200, mockDefaultData)
    
    const mockMapOn = jest.fn();

    jest.spyOn(mapboxgl, "Map")
        .mockImplementation(() => {
            return {
                on: mockMapOn
            }
        })


    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <TimelineBar />
                <MapCanvas />
            </Provider>
        );
    
    await waitFor(() => {
        screen.findByRole('main', { name: 'map-canvas' });
        expect(newStore.getState().timeline.bounds).not.toBeNull();
    });

    expect(mockMapOn).toHaveBeenCalled();
});


test.only("gets new data source on new fetches", async() => {
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl, { params: { 'year': 'default' } })
        .replyOnce(200, mockDefaultData)

    const mockMapOn = jest.fn();
    const mockMapAddSource = jest.fn();
    const mockMapGetSource = jest.fn();
    const mockMapRemoveSource = jest.fn();
    const mockMapAddLayer = jest.fn();
    const mockMapGetLayer = jest.fn();
    const mockMapRemoveLayer = jest.fn();

    jest.spyOn(mapboxgl, "Map")
        .mockImplementation(() => {
            return {
                on: mockMapOn,
                addSource: mockMapAddSource,
                getSource: mockMapGetSource,
                removeSource: mockMapRemoveSource,
                addLayer: mockMapAddLayer,
                getLayer: mockMapGetLayer,
                removeLayer: mockMapRemoveLayer
            }
        })


    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <TimelineBar />
                <MapCanvas />
            </Provider>
        );
    
    await waitFor(() => {
        screen.findByRole('main', { name: 'map-canvas' });
        expect(newStore.getState().timeline.bounds).not.toBeNull();
    });

    expect(mockMapOn).toHaveBeenCalled();
    // Manually set styleLoaded to true once map.on has been called.
    // TODO
});
    
