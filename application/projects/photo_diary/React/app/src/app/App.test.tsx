import React from 'react';
import { Provider } from 'react-redux';
import { setupStore } from '../app/store';
import thunk from 'redux-thunk';
import {
    cleanup,
    render,
    screen,
    waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import '@testing-library/jest-dom';
import mockDefaultData from '../utils/mockDefaultData.json';
import TimelineBar from '../features/TimelineBar/TimelineBar';
import FilterDrawer from '../features/FilterDrawer/FilterDrawer';
import App, { apiUrl } from './App';
// @ts-ignore
import mapboxgl from 'mapbox-gl'; 
import 'mapbox-gl/dist/mapbox-gl.css';


var mockAxios = new MockAdapter(axios);

beforeAll(() => {
    mockAxios = new MockAdapter(axios);
});

afterAll(() => {
    mockAxios.reset();
    cleanup;
});


/* =====================================================================
    Test for all features to be rendered.
===================================================================== */
xtest("renders all features on initial load", () => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl).reply(200, []);
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */
    
    const newStore = setupStore();
    render(
        <Provider store={newStore}>
            <App />
        </Provider>
    );

    expect(screen.getByRole('region', { name: 'timeline' })).toBeInTheDocument();
});