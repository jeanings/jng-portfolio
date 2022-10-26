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

    await waitFor(() => {
        screen.findByRole('menu', { name: 'Toolbar' })
        screen.findAllByRole('button', { name: 'Toolbar-button' })
    });

    // Verify toolbar is rendered.
    const toolbar = screen.getByRole('menu', { name: 'Toolbar' });
    expect(toolbar).toBeInTheDocument();

    // Verify individual toolbar buttons are rendered.
    const toolbarButtons = screen.getAllByRole('button', { name: 'Toolbar-button' });
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
        screen.findByRole('menu', { name: 'Toolbar' })
        screen.findAllByRole('button', { name: 'Toolbar-button' })
    });

    // Verify toolbar is rendered.
    const toolbar = screen.getByRole('menu', { name: 'Toolbar' });
    expect(toolbar).toBeInTheDocument();

    // Verify individual toolbar buttons are rendered.
    const toolbarButtons = screen.getAllByRole('button', { name: 'Toolbar-button' });
    expect(toolbarButtons.length).toEqual(3);

    // Verify button is not clicked.
    const buttonToClick = toolbarButtons[0];
    expect(buttonToClick.getAttribute('aria-pressed')).toEqual('false');
    expect(buttonToClick.classList).not.toContain("active");

    await waitFor(() => user.click(buttonToClick));

    // Verify button clicked.
    expect(buttonToClick.getAttribute('aria-pressed')).toEqual('true');
    expect(buttonToClick.classList).toContain("active");
});

xtest("drawer button clicks reveal, hide filter elements", () => {

});