import React from 'react';
import { Provider } from 'react-redux';
import { setupStore } from '../../app/store';
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
import TimelineBar from '../../features/TimelineBar/TimelineBar';
import FilterDrawer from '../../features/FilterDrawer/FilterDrawer';
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


/* =====================================================================
    Tests for UI buttons on bottom of screen.
===================================================================== */
test("renders bottom UI buttons", async() => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl)
        .reply(200, mockDefaultData);

    // Mocked Mapbox methods.
    const mockMapOn = jest.fn();

    jest.spyOn(mapboxgl, "Map")
        .mockImplementation(() => {
            return {
                on: mockMapOn
            }
        })
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

    const newStore = setupStore();
    render(
        <Provider store={newStore}>
            <Toolbar />
        </Provider>
    );

    await waitFor(() => screen.findByRole('menu', { name: 'toolbar' }));
    const toolbar = screen.getByRole('menu', { name: 'toolbar'});
    expect(toolbar).toBeInTheDocument();

});

xtest("drawer button clicks reveal, hide filter elements", () => {

});