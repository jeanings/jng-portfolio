import React from 'react';
import * as reactRedux from 'react-redux';
import { Provider } from 'react-redux';
import { setupStore, RootState } from '../../app/store';
import {
    cleanup,
    render,
    screen,
    waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import '@testing-library/jest-dom';
import mockDefaultData from '../../utils/mockDefaultData.json';
import MapCanvas from '../MapCanvas/MapCanvas';
import { GeojsonFeatureCollectionProps } from '../TimelineBar/timelineSlice';
import { 
    setStyleLoadStatus, 
    cleanupMarkerSource, 
    setSourceStatus, 
    setBoundsButton } from '../MapCanvas/mapCanvasSlice';
import { apiUrl } from '../../app/App';
import Toolbar from './Toolbar';
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
        query: { year: 2022 },
        yearInit: 2022,
        yearSelected: 2022,
        years: mockDefaultData.years,
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
        filteredSelectables: null,
        geojson: mockDefaultData.featureCollection as GeojsonFeatureCollectionProps,
        bounds: mockDefaultData.bounds
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
        markersStatus: 'idle',
        fitBoundsButton: 'idle'
    }
};


/* =====================================================================
    Tests for UI buttons on bottom of screen.
===================================================================== */
test("renders bottom UI buttons", async() => {
    const newStore = setupStore();
    render(
        <Provider store={newStore}>
            <Toolbar />
        </Provider>
    );

    await waitFor(() => {
        screen.findByRole('menu', { name: 'Toolbar' })
        screen.findAllByRole('button', { name: 'toolbar-button' })
    });

    // Verify toolbar is rendered.
    const toolbar = screen.getByRole('menu', { name: 'toolbar' });
    expect(toolbar).toBeInTheDocument();

    // Verify individual toolbar buttons are rendered.
    const toolbarButtons = screen.getAllByRole('button', { name: 'toolbar-button' });
    expect(toolbarButtons.length).toEqual(3);
});


test("clicks on toolbar buttons register changes to pressed status, style update", async() => {
    const newStore = setupStore();
    render(
        <Provider store={newStore}>
            <Toolbar />
        </Provider>
    );

    await waitFor(() => {
        screen.findByRole('menu', { name: 'toolbar' })
        screen.findAllByRole('button', { name: 'toolbar-button' })
    });

    // Verify toolbar is rendered.
    const toolbar = screen.getByRole('menu', { name: 'toolbar' });
    expect(toolbar).toBeInTheDocument();

    // Verify individual toolbar buttons are rendered.
    const toolbarButtons = screen.getAllByRole('button', { name: 'toolbar-button' });
    expect(toolbarButtons.length).toEqual(3);

    // Verify button is not clicked.
    const buttonToClick = toolbarButtons[0];
    expect(buttonToClick.getAttribute('aria-pressed')).toEqual('false');
    expect(buttonToClick).not.toHaveClass("active");

    await waitFor(() => user.click(buttonToClick));

    // Verify button clicked.
    expect(buttonToClick.getAttribute('aria-pressed')).toEqual('true');
    expect(buttonToClick).toHaveClass("active");
});


test("drawer button clicks reveal, hide filter elements", async() => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked document methods.
    const getElemByIdSpy = jest.spyOn(document, "getElementById");
    const mockFilterDrawerElem = document.createElement('div');
    getElemByIdSpy.mockReturnValue(mockFilterDrawerElem);

    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */
    const newStore = setupStore(preloadedState);
    render(
        <Provider store={newStore}>
            <Toolbar />
        </Provider>
    );

    await waitFor(() => {
        screen.findByRole('menu', { name: 'toolbar' })
        screen.findAllByRole('button', { name: 'toolbar-button' })
    });

    // Verify toolbar is rendered.
    const toolbar = screen.getByRole('menu', { name: 'toolbar' });
    expect(toolbar).toBeInTheDocument();

    // Verify individual toolbar buttons are rendered.
    const toolbarButtons = screen.getAllByRole('button', { name: 'toolbar-button' });
    expect(toolbarButtons.length).toEqual(3);

    // Get target button.
    const toolbarFilterButton: HTMLElement = toolbarButtons.filter(
        button => button.id === "Toolbar-filter")[0];
   
    // Test opening of filter drawer.
    await waitFor(() => user.click(toolbarFilterButton));
    expect(toolbarFilterButton.getAttribute('aria-pressed')).toEqual('true');
    expect(toolbarFilterButton).toHaveClass("active");

    // Verify filter drawer is shown.
    expect(getElemByIdSpy).toHaveBeenCalled();
    expect(mockFilterDrawerElem).toHaveClass("show");
    
    // Test closing of filter drawer.
    await waitFor(() => user.click(toolbarFilterButton));
    expect(toolbarFilterButton.getAttribute('aria-pressed')).toEqual('false');
    expect(toolbarFilterButton).not.toHaveClass("active");

    // Verify filter drawer is hidden.
    expect(mockFilterDrawerElem).toHaveClass("hide");
});


test("bounds button calls mapbox's fitBounds method", async() => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl, { params: { 'year': 'default' } })
        .replyOnce(200, mockDefaultData)

    // Mocked Mapbox methods.
    const mockMapOn = jest.fn();
    const mockMapAddSource = jest.fn();
    const mockMapGetSource = jest.fn();
    const mockMapAddLayer = jest.fn();
    const mockMapGetLayer = jest.fn();
    const mockMapFitBounds = jest.fn();

    jest.spyOn(mapboxgl, "Map")
        .mockImplementation(() => {
            return {
                on: mockMapOn,
                addSource: mockMapAddSource,
                getSource: mockMapGetSource,
                addLayer: mockMapAddLayer,
                getLayer: mockMapGetLayer,
                fitBounds: mockMapFitBounds
            }
        })

    // Mocked React functions.
    const useDispatchSpy = jest.spyOn(reactRedux, 'useDispatch');
    const mockDispatch = jest.fn();
    useDispatchSpy.mockReturnValue(mockDispatch);
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <MapCanvas />
                <Toolbar />
            </Provider>
        );
    
    // Wait for fetch.
    await waitFor(() => {
        screen.findByRole('main', { name: 'map-canvas' });
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
        'fitBoundsButton': 'idle'
    });

    // Verify individual toolbar buttons are rendered.
    const toolbarButtons = screen.getAllByRole('button', { name: 'toolbar-button' });
    expect(toolbarButtons.length).toEqual(3);

    // Get target button.
    const toolbarBoundsButton: HTMLElement = toolbarButtons.filter(
        button => button.getAttribute('id') === "Toolbar-bounds")[0];

    // Mock dispatch request to fitBounds.
    await waitFor (() => user.click(toolbarBoundsButton));
    newStore.dispatch(setBoundsButton('clicked'));

    // Verify fitBounds method called, one called on init and
    // the other on button click.
    expect(mockMapFitBounds).toHaveBeenCalledTimes(2);
});