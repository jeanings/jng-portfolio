import React from 'react';
import * as reactRedux from 'react-redux';
import { Provider, useDispatch } from 'react-redux';
import { setupStore, RootState } from '../../app/store';
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
import mock2015Data from '../../utils/mock2015Data.json';
import TimelineBar from '../TimelineBar/TimelineBar';
import {
    fetchImagesData,
    GeojsonFeatureCollectionProps,
    BboxType, 
    handleYearSelect} from '../TimelineBar/timelineSlice';
// @ts-ignore
import mapboxgl from 'mapbox-gl'; 
import 'mapbox-gl/dist/mapbox-gl.css';
import SideFilmStrip from './SideFilmStrip';

const MapboxglSpiderfier: any = require('mapboxgl-spiderifier');

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
        selected: { year: 2022, month: 'all' },
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
        imageDocs: mockDefaultData.docs,
        filterSelectables: mockDefaultData.filterSelectables[0],
        filteredSelectables: null,
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
        markersStatus: 'idle',
        fitBoundsButton: 'idle'
    }
};



/* ===============================================================
    Tests on state data, map, and image displaying interactions. 
=============================================================== */
test("renders side strip panel", async() => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl, { params: { 'year': 'default' } })
        .replyOnce(200, mockDefaultData);
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // Verify data to build film strip is available.
    expect(newStore.getState().timeline.imageDocs).not.toBeNull();

    // Check for side strip panel to be rendered.
    await waitFor(() => screen.findByRole('aside', { name: 'side-film-strip' }));
    const filmStripElem = screen.getByRole('aside', { name: 'side-film-strip' });
    expect(filmStripElem).toBeInTheDocument();
});


test("displays image collection in side strip panel", async() => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl, { params: { 'year': 'default' } })
        .replyOnce(200, mockDefaultData)
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // Verify data to build film strip is available.
    const imageDocs = newStore.getState().timeline.imageDocs
    expect(imageDocs).not.toBeNull();
    expect(imageDocs!.length).toEqual(40);

    // Wait for render.
    await waitFor(() => screen.findByRole('aside', { name: 'side-film-strip' }));
    const filmStripElem = screen.getByRole('aside', { name: 'side-film-strip' });
    expect(filmStripElem).toBeInTheDocument();

    // Verify correct length of image frames rendered.
    await waitFor(() => screen.findAllByRole('none', { name: 'image-frame' }));
    const imageFrameElems = screen.getAllByRole('none', { name: 'image-frame' });
    expect(imageFrameElems.length).toEqual(imageDocs!.length);

   
});
