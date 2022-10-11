import React from 'react';
import { Provider } from 'react-redux';
import store, { setupStore, RootState } from '../../app/store';
import { 
    act,
    cleanup, 
    fireEvent, 
    prettyDOM, 
    render, 
    screen, 
    waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import '@testing-library/jest-dom';
import mockDefaultData from '../../utils/mockDefaultData.json';
import mock2015Data from '../../utils/mock2015Data.json';
import FilterDrawer from './FilterDrawer';
import { addFilter, removeFilter } from './filterDrawerSlice';


var mockAxios = new MockAdapter(axios);
const user = userEvent.setup();
const preloadedState: RootState = {
    timeline: {
        request: 'idle',
        yearInit: null,
        yearSelected: null,
        years: null,
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
        filterSelectables: mockDefaultData.filterSelectables[0]
    },
    filter: {
        formatMedium: [],
        formatType: [],
        film: [],
        camera: [],
        lens: [],
        focalLength: [],
        tags: []
    }
};

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
    afterEach(() => {
        cleanup;
    });

    test("renders groups of filter options", async() => {
        const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <FilterDrawer />
            </Provider>
        );

        // Verify correct number of filter buttons rendered.
        await screen.findAllByRole('checkbox', { name: 'FilterDrawer-format-item'});

        const formatButtons = screen.getAllByRole('checkbox', { name: 'FilterDrawer-format-item'});
        expect(formatButtons.length).toEqual(2);

        const filmButtons = screen.getAllByRole('checkbox', { name: 'FilterDrawer-film-item'});
        expect(filmButtons.length).toEqual(2);

        const cameraButtons = screen.getAllByRole('checkbox', { name: 'FilterDrawer-camera-item'});
        expect(cameraButtons.length).toEqual(2);

        const lensButtons = screen.getAllByRole('checkbox', { name: 'FilterDrawer-lens-item'});
        expect(lensButtons.length).toEqual(2);

        const focalLengthButtons = screen.getAllByRole('checkbox', { name: 'FilterDrawer-focalLength-item'});
        expect(focalLengthButtons.length).toEqual(1);

        const tags = screen.getAllByRole('checkbox', { name: 'FilterDrawer-tags-item'});
        expect(tags.length).toEqual(36);
    });
});


/* =====================================================================
    Tests for initial rendering - async thunk, state-reliant elements.
===================================================================== */
describe("on filter button clicks", () => {
    afterEach(() => {
        cleanup;
    });

    const filterCategories = [
        { category: 'format', ariaLabel: 'FilterDrawer-format-item' },
        { category: 'film', ariaLabel: 'FilterDrawer-film-item' },
        { category: 'camera', ariaLabel: 'FilterDrawer-camera-item' },
        { category: 'lens', ariaLabel: 'FilterDrawer-lens-item' },
        { category: 'focalLength', ariaLabel: 'FilterDrawer-focalLength-item' },
        { category: 'tags', ariaLabel: 'FilterDrawer-tags-item' },
    ];

    filterCategories.forEach(group => {
        test("adds selected filter to existing array in state", async() => {
            const newStore = setupStore(preloadedState);
            render(
                <Provider store={newStore}>
                    <FilterDrawer />
                </Provider>
            );
    
            // Verify correct number of filter buttons rendered.
            const filterButtons = screen.getAllByRole('checkbox', { name: group.ariaLabel});
    
            // Verify filter button to not be pressed.
            const filterButtonToClick: HTMLElement = filterButtons[0];
            expect(filterButtonToClick.getAttribute('aria-pressed')).toEqual('false');

            let filterButtonText;
            // Parse text as in switch cases.
            if (group.category === 'focalLength') {
                filterButtonText = parseInt(filterButtonToClick.textContent!.replace('mm', ''))
            }
            else {
                filterButtonText = filterButtonToClick.textContent;
            }
            
            // Verify filter isn't in state.
            if (group.category === 'format') {
                if (filterButtonText === 'film' || filterButtonText === 'digital') {
                    expect(newStore.getState().filter[group.category.concat('Medium')])
                        .not.toContain(filterButtonText);
                }
                else {
                    expect(newStore.getState().filter[group.category.concat('Type')])
                        .not.toContain(filterButtonText);
                }
            }
            else {
                expect(newStore.getState().filter[group.category]).not.toContain(filterButtonText);
            }

            user.click(filterButtonToClick);
    
            // Wait for onClick.
            await waitFor(() => expect(filterButtonToClick.getAttribute('aria-pressed')).toEqual('true'));
            // Verify text of selected element matches newly added array element.
            if (group.category === 'format') {
                if (filterButtonText === 'film' || filterButtonText === 'digital') {
                    expect(newStore.getState().filter[group.category.concat('Medium')])
                        .toContain(filterButtonText);
                }
                else {
                    expect(newStore.getState().filter[group.category.concat('Type')])
                        .toContain(filterButtonText);
                }
            }
            else {
                expect(newStore.getState().filter[group.category]).toContain(filterButtonText);
            }
        });
    })    


    filterCategories.forEach(group => {
        afterEach(() => {
            cleanup;
        });

        test("removes selected filter from existing array in state", async() => {
            const newStore = setupStore(preloadedState);
            render(
                <Provider store={newStore}>
                    <FilterDrawer />
                </Provider>
            );

            // Verify initial empty state.
            screen.findAllByRole('checkbox', { name: group.ariaLabel });
            const filterButton = screen.getAllByRole('checkbox', { name: group.ariaLabel });
            const filterButtonToClick: HTMLElement = filterButton[0];
            let filterButtonText: string | number;
            let stateKey: string;
            // expect(newStore.getState().filter.lens).not.toContain(lensSelected);

            // Parse key/val pairs to prepare them for correct dispatching.
            if (group.category === 'format') {
                filterButtonText = filterButtonToClick.textContent as string;
                if (filterButtonText === 'film' || filterButtonText === 'digital') {
                    stateKey = 'formatMedium';
                }
                else {
                    stateKey = 'formatType';
                }
            }
            else if (group.category === 'focalLength') {
                stateKey = group.category;
                filterButtonText = parseInt(filterButtonToClick.textContent!.replace('mm', ''))
            }
            else {
                stateKey = group.category;
                filterButtonText = filterButtonToClick.textContent as string;
            }


            // Mock pressed status. 
            filterButtonToClick.setAttribute('aria-pressed', 'true');
            await waitFor (() => newStore.dispatch(addFilter(
                { [stateKey]: filterButtonText }
            )));

            expect(newStore.getState().filter[stateKey]).toContain(filterButtonText);

            // Simulate click on "pressed" filter button.
            user.click(filterButtonToClick);


            // Verify filter is removed from state.
            await waitFor(() => {
                expect(newStore.getState().filter[stateKey]).not.toContain(filterButtonText);
            });
            
        });
    })
});