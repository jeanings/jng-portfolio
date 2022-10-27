import React from 'react';
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
        geojson: null,
        bounds: null
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
        screen.findByRole('menu', { name: 'Toolbar' })
        screen.findAllByRole('button', { name: 'Toolbar-button' })
    });

    // Verify toolbar is rendered.
    const toolbar = screen.getByRole('menu', { name: 'Toolbar' });
    expect(toolbar).toBeInTheDocument();

    // Verify individual toolbar buttons are rendered.
    const toolbarButtons = screen.getAllByRole('button', { name: 'Toolbar-button' });
    expect(toolbarButtons.length).toEqual(3);

    // Get target button.
    const toolbarFilterButton: HTMLElement = toolbarButtons.filter(
        button => button.getAttribute('id') === "Toolbar-filter")[0];
   
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