import React from 'react';
import * as reactRedux from 'react-redux';
import { Provider } from 'react-redux';
import { setupStore, RootState } from '../../app/store';
import { 
    cleanup, 
    render, 
    screen, 
    waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { apiUrl } from '../../app/App';
import mockDefaultData from '../../utils/mockDefaultData.json';
import mock2015Data from '../../utils/mock2015Data.json';
import preloadedState from '../../utils/testHelpers';
import TimelineBar from '../TimelineBar/TimelineBar';
import { handleYearSelect} from '../TimelineBar/timelineSlice';
import MapCanvas from './MapCanvas';
import { 
    setStyleLoadStatus, 
    cleanupMarkerSource, 
    setSourceStatus } from './mapCanvasSlice';
// @ts-ignore
import mapboxgl from 'mapbox-gl'; 
import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxglSpiderfier: any = require('mapboxgl-spiderifier');

var mockAxios = new MockAdapter(axios);
var user = userEvent.setup();

beforeEach(() => {
    mockAxios = new MockAdapter(axios);
});

afterEach(() => {
    mockAxios.reset();
    jest.clearAllMocks(); 
    jest.resetAllMocks(); 
    cleanup;
});


/* -------------------------------------------------
    Mocked Mapbox.
------------------------------------------------- */
jest.mock('mapbox-gl');

// Mocked Mapbox methods.
const mockMapOn = jest.fn();
const mockMapOff = jest.fn();
const mockMapGetCanvas = jest.fn();
const mockMapAddSource = jest.fn();
const mockMapGetSource = jest.fn();
const mockMapRemoveSource = jest.fn();
const mockMapAddLayer = jest.fn();
const mockMapGetLayer = jest.fn();
const mockMapRemoveLayer = jest.fn();
const mockMapFitBounds = jest.fn();
const mockMapAddControl = jest.fn();
const mockMapRemoveControl = jest.fn();
const mockMapHasControl = jest.fn();


/* --------------------------------------
    Boilerplate for rendering document.
-------------------------------------- */
function renderBoilerplate(preloadedState?: RootState) {
    const newStore = setupStore(preloadedState);
    const container = render(
        <Provider store={newStore}>
            <MemoryRouter>
                <TimelineBar />
                <MapCanvas />
            </MemoryRouter>
        </Provider>
    );
    return { ...container, newStore };
}


/* ================================================
    Tests on map methods being called on renders.
================================================ */
test("initializes map on rendering", async() => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl, { params: { 'year': 'default' } })
        .replyOnce(200, mockDefaultData)
    
    // Spied Mapbox methods.
    // const spyMapOn = jest.spyOn(mapbox, 'Map')
    const mapbox = require('mapbox-gl');
    jest.spyOn(mapbox, 'Map')
        .mockImplementation(() => {
            return {
                on: mockMapOn,
                off: mockMapOff,
                getCanvas: mockMapGetCanvas,
                addSource: mockMapAddSource,
                addLayer: mockMapAddLayer,
                getSource: mockMapGetSource,
                getLayer: mockMapGetLayer,
                removeSource: mockMapRemoveSource,
                removeLayer: mockMapRemoveLayer,
                fitBounds: mockMapFitBounds,
                addControl: mockMapAddControl,
                removeControl: mockMapRemoveControl,
                hasControl: mockMapHasControl
            }
        });
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

    const { newStore } = renderBoilerplate(preloadedState);
    
    // Wait for fetch.
    await waitFor(() => screen.findByRole('main', { name: 'map' }));
    expect(newStore.getState().timeline.bounds).not.toBeNull();

    // Initial map.on('load') call.
    expect(mockMapOn).toHaveBeenCalled();
});


test("adds new data source on new fetches and adds zoom controls", async() => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl, { params: { 'year': 'default' } })
        .replyOnce(200, mockDefaultData)

    // Spied Mapbox methods.
    const mapbox = require('mapbox-gl');
    jest.spyOn(mapbox, 'Map')
        .mockImplementation(() => {
            return {
                on: mockMapOn,
                off: mockMapOff,
                getCanvas: mockMapGetCanvas,
                addSource: mockMapAddSource,
                addLayer: mockMapAddLayer,
                getSource: mockMapGetSource,
                getLayer: mockMapGetLayer,
                removeSource: mockMapRemoveSource,
                removeLayer: mockMapRemoveLayer,
                fitBounds: mockMapFitBounds,
                addControl: mockMapAddControl,
                removeControl: mockMapRemoveControl,
                hasControl: jest.fn().mockReturnValue(false)
            }
        });
        
    // Mocked React functions.
    const useDispatchSpy = jest.spyOn(reactRedux, 'useDispatch');
    const mockDispatch = jest.fn();
    useDispatchSpy.mockReturnValue(mockDispatch);

    // Set viewport size.
    global.innerWidth = 1920;
    global.innerHeight = 1080;
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

    const { newStore } = renderBoilerplate(preloadedState);

    // Verify mocked initialization.
    await waitFor(() => expect(newStore.getState().timeline.responseStatus).toEqual('idle'));
    // Assert no initial API call, since initYear isn't null (store has preloaded state).
    expect(mockDispatch).toHaveBeenCalledTimes(0);

    // Wait for map render.
    await waitFor(() => screen.findByRole('main', { name: 'map' }));

    // ----- useEffect: bounds !== null -----
    // Initial map.on('load') call.
    expect(mockMapOn).toHaveBeenCalled();

    // ----- useEffect: map.current !== false -----
    // Mock dispatch once map.on has been called.
    newStore.dispatch(setStyleLoadStatus(true));
    await waitFor(() => expect(newStore.getState().mapCanvas.styleLoaded).toEqual(true));
    
    // ----- useEffect: styeLoaded === true -----
    // map.addControl() call.
    await waitFor(() => expect(mockMapAddControl).toHaveBeenCalled());
    // Verify map.addsource() call, new data added.
    await waitFor(() => expect(mockMapAddSource).toHaveBeenCalled());
    // Mock dispatch for useEffect, styleLoaded condition.
    newStore.dispatch(setSourceStatus('loaded'));
    await waitFor(() => expect(newStore.getState().mapCanvas.sourceStatus).toEqual('loaded'));    
});
    

test("adds marker layer and fits map to bounds", async() => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl, { params: { 'year': 'default' } })
        .replyOnce(200, mockDefaultData)

    // Mocked Mapbox methods.
    const mapbox = require('mapbox-gl');
    jest.spyOn(mapbox, 'Map')
        .mockImplementation(() => {
            return {
                on: mockMapOn,
                off: mockMapOff,
                getCanvas: mockMapGetCanvas,
                addSource: mockMapAddSource,
                addLayer: mockMapAddLayer,
                getSource: mockMapGetSource,
                getLayer: mockMapGetLayer,
                removeSource: mockMapRemoveSource,
                removeLayer: mockMapRemoveLayer,
                fitBounds: mockMapFitBounds,
                addControl: mockMapAddControl,
                removeControl: mockMapRemoveControl,
                hasControl: mockMapHasControl
            }
        });

    // Mocked React functions.
    const useDispatchSpy = jest.spyOn(reactRedux, 'useDispatch');
    const mockDispatch = jest.fn();
    useDispatchSpy.mockReturnValue(mockDispatch);
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

    const { newStore } = renderBoilerplate(preloadedState);
    
    // Wait for fetch.
    await waitFor(() => screen.findByRole('main', { name: 'map' }));
    expect(newStore.getState().timeline.bounds).not.toBeNull();

    // Mock dispatches for layer-adding conditions.
    newStore.dispatch(setStyleLoadStatus(true));
    newStore.dispatch(cleanupMarkerSource('idle'));
    newStore.dispatch(setSourceStatus('loaded'));
    
    // Verify states are updated.
    expect(newStore.getState().mapCanvas).toEqual({
        'styleLoaded': true,
        'markersStatus': 'idle', 
        'sourceStatus': 'loaded',
        'fitBoundsButton': 'idle',
        'markerLocator': 'idle'
    });

    // Map layer added and bounds fitted.
    expect(mockMapAddLayer).toHaveBeenCalled();
    expect(mockMapFitBounds).toHaveBeenCalled();
    // Action dispatched to set markerStatus.
    expect(mockDispatch).toHaveBeenCalled();
});


test("replaces previous layer and source on new data fetches", async() => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl, { params: { 'year': 'default' } })
        .replyOnce(200, mockDefaultData)
        .onGet(apiUrl, { params: { 'year': 2015 } })
        .replyOnce(200, mock2015Data)

    // Mocked Mapbox methods.
    const mapbox = require('mapbox-gl');
    jest.spyOn(mapbox, 'Map')
        .mockImplementation(() => {
            return {
                on: mockMapOn,
                off: mockMapOff,
                getCanvas: mockMapGetCanvas,
                addSource: mockMapAddSource,
                addLayer: mockMapAddLayer,
                getSource: mockMapGetSource,
                getLayer: mockMapGetLayer,
                removeSource: mockMapRemoveSource,
                removeLayer: mockMapRemoveLayer,
                fitBounds: mockMapFitBounds,
                addControl: mockMapAddControl,
                removeControl: mockMapRemoveControl,
                hasControl: mockMapHasControl
            }
        });

    mockMapGetLayer.mockReturnValue('some-layer');
    mockMapGetSource.mockReturnValue('some-source');

    // Mocked React functions.
    const useDispatchSpy = jest.spyOn(reactRedux, 'useDispatch');
    const mockDispatch = jest.fn();
    useDispatchSpy.mockReturnValue(mockDispatch);
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

    const { newStore } = renderBoilerplate(preloadedState);
    
    // Wait for fetch.
    await waitFor(() => {
        screen.findByRole('main', { name: 'map' });
        expect(newStore.getState().timeline.bounds).not.toBeNull();
    });

    // Mock dispatches for layer-adding conditions.
    newStore.dispatch(setStyleLoadStatus(true));
    newStore.dispatch(cleanupMarkerSource('idle'));
    newStore.dispatch(setSourceStatus('loaded'));
    
    // Verify states are updated.
    expect(newStore.getState().mapCanvas).toEqual({
        'styleLoaded': true,
        'markersStatus': 'idle', 
        'sourceStatus': 'loaded',
        'fitBoundsButton': 'idle',
        'markerLocator': 'idle'
    });

    // Map layer added and bounds fitted.
    expect(mockMapAddLayer).toHaveBeenCalled();
    expect(mockMapFitBounds).toHaveBeenCalled();

    // Mock year selection dispatch.
    newStore.dispatch(handleYearSelect(2015));

    await waitFor(() => {
        expect(newStore.getState().timeline.responseStatus).toEqual('idle');
        expect(newStore.getState().timeline.selected.year).toEqual(2015);
    });

    // Verify removal of previous layer.
    expect(mockMapGetLayer).toHaveBeenCalled();         // not undefined,
    expect(mockMapRemoveLayer).toHaveBeenCalled();      // removeSource called.

    // And data source.
    expect(mockMapGetSource).toHaveBeenCalled();        // not undefined,
    expect(mockMapRemoveSource).toHaveBeenCalled();     // removeLayer called.

    // Verify new source added.
    expect(mockMapAddSource).toHaveBeenCalled();
});
    


/* =====================================================
    Tests on fetch errors affecting map functionality.
===================================================== */
test("does not initialize map on unsuccessful fetch", async() => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl, { params: { 'year': 'default' } })
        .replyOnce(404, [])
    
    // Mocked Mapbox methods.
    const mapbox = require('mapbox-gl');
    jest.spyOn(mapbox, 'Map')
        .mockImplementation(() => {
            return {
                on: mockMapOn,
                off: mockMapOff,
                getCanvas: mockMapGetCanvas,
                addSource: mockMapAddSource,
                addLayer: mockMapAddLayer,
                getSource: mockMapGetSource,
                getLayer: mockMapGetLayer,
                removeSource: mockMapRemoveSource,
                removeLayer: mockMapRemoveLayer,
                fitBounds: mockMapFitBounds,
                addControl: mockMapAddControl,
                removeControl: mockMapRemoveControl,
                hasControl: mockMapHasControl
            }
        });

    // Mocked React functions.
    const useDispatchSpy = jest.spyOn(reactRedux, 'useDispatch');
    const mockDispatch = jest.fn();
    useDispatchSpy.mockReturnValue(mockDispatch);
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

    const { newStore } = renderBoilerplate();
    
    // Wait for fetch.
    await waitFor(() => screen.findByRole('main', { name: 'map' }));
    expect(newStore.getState().timeline.bounds).toBeNull();
    
    // Failed initial map.on('load') call.
    expect(mockMapOn).not.toHaveBeenCalled();
});