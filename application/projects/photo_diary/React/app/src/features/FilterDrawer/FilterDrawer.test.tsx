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
import { apiUrl } from '../../app/App';
import '@testing-library/jest-dom';
import mockDefaultData from '../../utils/mockDefaultData.json';
import mock2022Data from '../../utils/mock2022Data.json';
import mock2015Data from '../../utils/mock2015Data.json';
import TimelineBar from '../TimelineBar/TimelineBar';
import FilterDrawer from './FilterDrawer';
import { addFilter } from './filterDrawerSlice';


var mockAxios = new MockAdapter(axios);
var user = userEvent.setup();

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
        geojson: null
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
    map: {
        styleLoaded: false,
        sourceStatus: 'idle',
        markersStatus: 'idle'
    }
};

const preloadedStateWithFilter: RootState = {
    timeline: {
        request: 'complete',
        yearInit: 2022,
        yearSelected: 2022,
        years: mockDefaultData.years,
        month: 'jan',
        counter: preloadedState.timeline.counter,
        imageDocs: preloadedState.timeline.imageDocs,
        filterSelectables: mockDefaultData.filterSelectables[0],
        geojson: null
    },
    filter: {
        formatMedium: [],
        formatType: [],
        film: [ "Kodak_Gold_200", "Fujifilm_Superia_X-TRA_400" ],
        camera: [],
        lens: [],
        focalLength: [],
        tags: []
    },
    map: {
        styleLoaded: false,
        sourceStatus: 'idle',
        markersStatus: 'idle'
    }
}

beforeEach(() => {
    mockAxios = new MockAdapter(axios);
});

afterEach(() => {
    mockAxios.reset();
    cleanup;
});


/* =====================================================================
    Tests for initial rendering - async thunk, state-reliant elements.
===================================================================== */
describe("on initial load", () => {
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
    Tests for simulating clicks and their effects.
===================================================================== */
describe("on filter button clicks", () => {
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });
    
    afterEach(() => {
        mockAxios.reset();
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

            // Wait for onClick.
            await waitFor(() => user.click(filterButtonToClick));
            await waitFor(() => expect(filterButtonToClick.getAttribute('aria-pressed')).toEqual('true'));
            
            // ----------------- Same logic as in switch cases of FilterButton START -----------------
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
            else if (group.category === 'camera') {
                const make: string = (filterButtonText! as string).split(' ', 1)[0];
                const modelStrings: Array<string> = (filterButtonText! as string).split(' ')
                    .filter(model => !model.includes(make));
                let camera: string = '';
                
                // Reconstruct camera model if it contains multiple parts of text.
                modelStrings.forEach(modelString =>
                    camera = camera.concat(' ', modelString).trim()
                );
            }
            else {
                expect(newStore.getState().filter[group.category]).toContain(filterButtonText);
            }
            // ----------------- Same logic as in switch cases of FilterButton END -----------------
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
            const filterButtons = screen.getAllByRole('checkbox', { name: group.ariaLabel });
            const filterButtonToClick: HTMLElement = filterButtons[0];
            let filterButtonText: string | number;
            let stateKey: string;

            // Parse key/val pairs to prepare them for correct dispatching,
            // as done in switch cases.
            // ----------------- Same logic as in switch cases of FilterButton START -----------------
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
            else if (group.category === 'camera') {
                stateKey = group.category;
                const make: string = (filterButtonToClick.textContent! as string).split(' ', 1)[0];
                const modelStrings: Array<string> = (filterButtonToClick.textContent! as string).split(' ')
                    .filter(model => !model.includes(make));
                let camera: string = '';
                
                // Reconstruct camera model if it contains multiple parts of text.
                modelStrings.forEach(modelString =>
                    camera = camera.concat(' ', modelString).trim()
                );

                filterButtonText = camera;
            }
            else {
                stateKey = group.category;
                filterButtonText = filterButtonToClick.textContent as string;
            }
            // ----------------- Same logic as in switch cases of FilterButton END -----------------

            // Mock pressed status. 
            filterButtonToClick.setAttribute('aria-pressed', 'true');

            await waitFor (() => {
                newStore.dispatch(addFilter({ [stateKey]: filterButtonText }));
                expect(filterButtonToClick.getAttribute('aria-pressed')).toEqual('true');
                expect(newStore.getState().filter[stateKey]).toContain(filterButtonText);
            });

            // Simulate click on "pressed" filter button.
            await waitFor(() => user.click(filterButtonToClick));

            // Verify filter is removed from state.
            await waitFor(() => {
                expect(filterButtonToClick.getAttribute('aria-pressed')).toEqual('false');
                expect(newStore.getState().filter[stateKey]).not.toContain(filterButtonText);
            });
        });
    });
});


/* =====================================================================
    Tests that interact with other components.
===================================================================== */
test("<< filter >> state resets to initial state when year is changed", async() => {
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl, { params: { 'year': 2022, 'format-medium': 'film' } })
        .replyOnce(200, mock2015Data)
        .onGet(apiUrl, { params: { 'year': 2015 } })
        .replyOnce(200, mock2015Data)

    const newStore = setupStore(preloadedStateWithFilter);
    render(
        <Provider store={newStore}>
            <TimelineBar />
            <FilterDrawer />
        </Provider>
    );

    expect(newStore.getState().timeline.request).toEqual('complete');
    // Verify filter to click's state is blank.
    expect(newStore.getState().filter.film!.length).toEqual(0);
    
    // Wait for elements to render.
    await waitFor(() => screen.findAllByRole('menuitemradio', { name: 'year-item'}));
    const yearElems = screen.getAllByRole('menuitemradio', { name: 'year-item' });

    screen.findAllByRole('checkbox', { name: "FilterDrawer-film-item" });
    const filterButtons = screen.getAllByRole('checkbox', { name: "FilterDrawer-film-item" });

    // Get filter button element to click: FILM -> Kodak Gold 200.
    let filterButtonToClick = filterButtons.filter(button => button.textContent === 'Kodak Gold 200')[0];
    await waitFor(() => user.click(filterButtonToClick));

    // Verify filter state isn't blank.
    await waitFor(() => expect(newStore.getState().filter.film).toContain(filterButtonToClick.textContent));

    // Click on a year.
    const yearSelectElem = yearElems.find(element => element.textContent === '2015') as HTMLElement;
    await waitFor(() => user.click(yearSelectElem));

    // Wait for fetch to resolve.
    await waitFor(() => expect(newStore.getState().timeline.yearSelected).toEqual(2015));
    
    // Filters get cleared.
    expect(newStore.getState().filter.film!.length).toEqual(0);        
})


test("dispatches fetch request on << filter >> state changes", async() => {
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl, { params: { 'year': 'default' } })
        .replyOnce(200, mockDefaultData)
        .onGet(apiUrl, { params: { 'year': 2022, 'format-medium': 'film' } })
        .replyOnce(200, mock2022Data)

    const newStore = setupStore();
        render(
            <Provider store={newStore}>
                <TimelineBar />
                <FilterDrawer />
            </Provider>
        );
        
    expect(newStore.getState().timeline.request).toEqual('idle');
    await waitFor(() => expect(newStore.getState().timeline.request).toEqual('complete'));
    
    // Verify number of docs for initial fetch request.
    expect(newStore.getState().timeline.counter.all).toEqual(40);

    screen.findAllByRole('checkbox', { name: "FilterDrawer-format-item" });
    const filterButtons = screen.getAllByRole('checkbox', { name: "FilterDrawer-format-item" });

    // Get filter button element to click: FORMAT -> film.
    let filterButtonToClick = filterButtons.filter(button => button.textContent === 'film')[0];
    await waitFor(() => user.click(filterButtonToClick));

    expect(newStore.getState().filter.formatMedium).toContain('film');

    // Verify fetch returning different set of data.
    expect(newStore.getState().timeline.counter.all).not.toEqual(40);
});
