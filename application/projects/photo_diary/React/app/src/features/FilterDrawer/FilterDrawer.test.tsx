import React from 'react';
import { Provider } from 'react-redux';
import { setupStore } from '../../app/store';
import { 
    act,
    cleanup, 
    fireEvent, 
    render, 
    screen, 
    waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import '@testing-library/jest-dom';
import { apiUrl } from '../../app/App';
import mockDefaultData from '../../utils/mockDefaultData.json';
import mock2015Data from '../../utils/mock2015Data.json';
import TimelineBar from '../TimelineBar/TimelineBar';
import FilterDrawer from './FilterDrawer';


var mockAxios = new MockAdapter(axios);

beforeAll(() => {
    mockAxios = new MockAdapter(axios);
});

afterAll(() => {
    mockAxios.reset();
    cleanup;
});


/* =====================================================================
    Tests for initial rendering - async thunk, state-reliant elements.
===================================================================== */
describe("on initial renders", () => {
    beforeEach(() => {
        // Intercept get requests to live API, returning default local data.
        mockAxios = new MockAdapter(axios);
        mockAxios.onGet(apiUrl, { params: { 'year': 'default' } })
            .reply(200, mockDefaultData);
    });

    afterEach(() => {
        mockAxios.reset();
        cleanup;
    });

    test("renders groups of filter options", async() => {
        const newStore = setupStore();
        render(
            <Provider store={newStore}>
                <TimelineBar />
                <FilterDrawer />
            </Provider>
        );
        
        // Confirm initial << timeline.request >> state.
        expect(newStore.getState().timeline.request).toBe('idle');
        
        // await expect(tags.length).toEqual(36);
        // Wait for async thunk to handle response.

        await waitFor(() => {
            // Wait for fetch request to be complete, << timeline.filterSelectables >> to be updated.
            expect(newStore.getState().timeline.request).toBe('complete');

            // Verify correct number of filter buttons rendered.
            screen.findAllByRole('checkbox', { name: 'FilterDrawer-format-item'});
            const formatButtons = screen.getAllByRole('checkbox', { name: 'FilterDrawer-format-item'});
            expect(formatButtons.length).toEqual(2);

            // screen.findAllByRole('checkbox', { name: 'FilterDrawer-film-item'});
            const filmButtons = screen.getAllByRole('checkbox', { name: 'FilterDrawer-film-item'});
            expect(filmButtons.length).toEqual(2);

            // screen.findAllByRole('checkbox', { name: 'FilterDrawer-camera-item'});
            const cameraButtons = screen.getAllByRole('checkbox', { name: 'FilterDrawer-camera-item'});
            expect(cameraButtons.length).toEqual(2);

            // screen.findAllByRole('checkbox', { name: 'FilterDrawer-lens-item'});
            const lensButtons = screen.getAllByRole('checkbox', { name: 'FilterDrawer-lens-item'});
            expect(lensButtons.length).toEqual(2);

            // screen.findAllByRole('checkbox', { name: 'FilterDrawer-focalLength-item'});
            const focalLengthButtons = screen.getAllByRole('checkbox', { name: 'FilterDrawer-focalLength-item'});
            expect(focalLengthButtons.length).toEqual(1);

            // screen.findAllByRole('checkbox', { name: 'FilterDrawer-tags-item'});
            const tags = screen.getAllByRole('checkbox', { name: 'FilterDrawer-tags-item'});
            expect(tags.length).toEqual(36);


        });
    });
});