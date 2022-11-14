import React from 'react';
import { Provider } from 'react-redux';
import { setupStore, RootState } from '../../app/store';
import { 
    cleanup, 
    getAllByRole, 
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
import mock2022DataJun from '../../utils/mock2022DataJun.json';
import mock2015Data from '../../utils/mock2015Data.json';
import TimelineBar from '../TimelineBar/TimelineBar';
import { TimelineProps } from '../TimelineBar/timelineSlice';
import FilterDrawer from './FilterDrawer';
import { addFilter } from './filterDrawerSlice';


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
        imageDocs: null,
        filterSelectables: mockDefaultData.filterSelectables[0],
        filteredSelectables: null,
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
        markersStatus: 'idle',
        fitBoundsButton: 'idle'
    },
    sideFilmStrip: {
        enlargeDoc: null
    },
    toolbar: {
        filter: 'off',
        imageEnlarger: 'off'
    }
};

const preloadedStateWithFilter: RootState = {
    timeline: {
        request: 'complete',
        query: { year: 2022, tags: [ "Kodak_Gold_200", "Fujifilm_Superia_X-TRA_400" ] },
        yearInit: 2022,
        selected: { year: 2022, month: 'all' },
        years: mockDefaultData.years,
        counter: preloadedState.timeline.counter,
        imageDocs: preloadedState.timeline.imageDocs,
        filterSelectables: mockDefaultData.filterSelectables[0],
        filteredSelectables: null,
        geojson: null,
        bounds: null
    },
    filter: {
        formatMedium: [],
        formatType: [],
        film: [ "Kodak Gold 200", "Fujifilm Superia X-TRA 400" ],
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
    },
    sideFilmStrip: {
        enlargeDoc: null
    },
    toolbar: {
        filter: 'off',
        imageEnlarger: 'off'
    }
}


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
        await screen.findAllByRole('checkbox', { name: 'filter-drawer-format-item'});

        const formatButtons = screen.getAllByRole('checkbox', { name: 'filter-drawer-format-item'});
        expect(formatButtons.length).toEqual(2);

        const filmButtons = screen.getAllByRole('checkbox', { name: 'filter-drawer-film-item'});
        expect(filmButtons.length).toEqual(2);

        const cameraButtons = screen.getAllByRole('checkbox', { name: 'filter-drawer-camera-item'});
        expect(cameraButtons.length).toEqual(2);

        const lensButtons = screen.getAllByRole('checkbox', { name: 'filter-drawer-lens-item'});
        expect(lensButtons.length).toEqual(2);

        const focalLengthButtons = screen.getAllByRole('checkbox', { name: 'filter-drawer-focalLength-item'});
        expect(focalLengthButtons.length).toEqual(1);

        const tags = screen.getAllByRole('checkbox', { name: 'filter-drawer-tags-item'});
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
        { category: 'format', ariaLabel: 'filter-drawer-format-item' },
        { category: 'film', ariaLabel: 'filter-drawer-film-item' },
        { category: 'camera', ariaLabel: 'filter-drawer-camera-item' },
        { category: 'lens', ariaLabel: 'filter-drawer-lens-item' },
        { category: 'focalLength', ariaLabel: 'filter-drawer-focalLength-item' },
        { category: 'tags', ariaLabel: 'filter-drawer-tags-item' },
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


    test("clicks on reset button clears all filters", async() => {
        const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <FilterDrawer />
            </Provider>
        );
    
        expect(newStore.getState().timeline.request).toEqual('complete');
        // Verify filter to click's state is blank.
        expect(newStore.getState().filter.film!.length).toEqual(0);
        
        // Wait for elements to render.
        await waitFor(() => screen.findAllByRole('checkbox'));
        const filterButtons = screen.getAllByRole('checkbox');
    
        // Mock-click a bunch of filter buttons.
        const buttonsCategory: object = {
            'film': 'Kodak Gold 200',
            'formatType': '35mm',
            'tags': 'day'
        };
        let filterButtonsToClick = filterButtons.filter(button => 
            Object.values(buttonsCategory).includes(button.textContent as string));

        for (let button of filterButtonsToClick) {
            button.setAttribute('aria-pressed', 'true');
            let filterName = button.textContent as string;
            let filterType = '';

            for (let option of Object.entries(buttonsCategory)) {
                if (filterName === option[1]) {
                    filterType = option[0]
                }
            }
            
            let payload = { [filterType]: filterName };
            newStore.dispatch(addFilter(payload));
            expect(newStore.getState().filter[filterType]).toContain(filterName);
        };

        // Click reset button
        const resetButton = screen.getByRole('button', { name: 'filter-drawer-reset' })
        expect(resetButton).toBeInTheDocument();
        await waitFor(() => user.click(resetButton));
    
        for (let option of Object.entries(buttonsCategory)) {
            expect(newStore.getState().filter[option[0]]).not.toContain(option[1]);
        }
    });


    test("grey-out reset button if no filters selected", async() => {
        const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <FilterDrawer />
            </Provider>
        );

        expect(newStore.getState().timeline.request).toEqual('complete');
        // Verify filter to click's state is blank.
        expect(newStore.getState().filter.film!.length).toEqual(0);
        
        // Wait for elements to render.
        await waitFor(() => screen.findAllByRole('checkbox'));
        const filterButtons = screen.getAllByRole('checkbox');

        // Mock-click a filter button.
        const buttonsCategory: object = {
            'film': 'Kodak Gold 200',
        };
        let filterButtonToClick = filterButtons.filter(button => 
            Object.values(buttonsCategory).includes(button.textContent as string))[0];
        
        filterButtonToClick.setAttribute('aria-pressed', 'true');
        let filterType = Object.keys(buttonsCategory)[0];
        let filterName = Object.values(buttonsCategory)[0];        
        let payload = { [filterType]: filterName };
        newStore.dispatch(addFilter(payload));
        expect(newStore.getState().filter[filterType]).toContain(filterName);
        
        const resetButton = screen.getByRole('button', { name: 'filter-drawer-reset' })
        expect(resetButton).toBeInTheDocument();

        // Verify reset button not greyed out.
        expect(resetButton).not.toHaveClass("unavailable");

        // Click reset button.
        await waitFor(() => user.click(resetButton));
        
        // Verify reset button greyed out.
        expect(resetButton).toHaveClass("unavailable");
    });
});


/* =====================================================================
    Tests that interact with other components.
===================================================================== */
test("<< filter >> state resets to initial state when year is changed", async() => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl, { params: { 'year': 2015 } })
        .replyOnce(200, mock2015Data)
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */
    
    const newStore = setupStore(preloadedStateWithFilter);
    render(
        <Provider store={newStore}>
            <TimelineBar />
            <FilterDrawer />
        </Provider>
    );

    // Wait for elements to render.
    await waitFor(() => screen.findAllByRole('menuitemradio', { name: 'year-item'}));
    const yearElems = screen.getAllByRole('menuitemradio', { name: 'year-item' });

    // Verify filter state isn't blank.
    expect(newStore.getState().filter.film!.length).not.toEqual(0);

    // Click on a year.
    const yearSelectElem = yearElems.find(element => element.textContent === '2015') as HTMLElement;
    await waitFor(() => user.click(yearSelectElem));

    // Wait for fetch to resolve.
    await waitFor(() => expect(newStore.getState().timeline.selected.year).toEqual(2015));
    
    // Verify filters get cleared.
    expect(newStore.getState().filter.film!.length).toEqual(0);        
});


test("dispatches fetch request on << filter >> state changes", async() => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl, { params: { 'year': 'default' } })
        .replyOnce(200, mockDefaultData)
        .onGet(apiUrl, { params: { 'year': 2022, 'format-medium': 'film' } })
        .replyOnce(200, mock2022Data)
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

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

    screen.findAllByRole('checkbox', { name: "filter-drawer-format-item" });
    const filterButtons = screen.getAllByRole('checkbox', { name: "filter-drawer-format-item" });

    // Get filter button element to click: FORMAT -> film.
    let filterButtonToClick = filterButtons.filter(button => button.textContent === 'film')[0];
    await waitFor(() => user.click(filterButtonToClick));

    expect(newStore.getState().filter.formatMedium).toContain('film')
    // Verify fetch returning different set of data.
    expect(newStore.getState().timeline.counter.all).not.toEqual(40);
});


test("disables/greys out filter buttons not available on selected month", async() => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl, { params: { 'year': 'default' } })
        .replyOnce(200, mockDefaultData)
        .onGet(apiUrl, { params: { 'year': 2022, 'month': 6 } })
        .replyOnce(200, mock2022DataJun)
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

    const newStore = setupStore();
        render(
            <Provider store={newStore}>
                <TimelineBar />
                <FilterDrawer />
            </Provider>
        );
    
    // Wait for initial render.
    expect(newStore.getState().timeline.request).toEqual('idle');
    await waitFor(() => expect(newStore.getState().timeline.request).toEqual('complete'));

    // Verify all filter buttons are enabled.
    const filterButtons = screen.getAllByRole('checkbox');
    filterButtons.forEach((button) => {
        expect(button).not.toHaveClass("unavailable");
    });

    // Select a month.
    const monthToSelect: string = 'jun';
    const monthElems = screen.getAllByRole('menuitemradio', { name: 'month-item' });
    const monthElemToSelect = monthElems.find(element => 
        element.textContent!.replace(/\d+/, "") === monthToSelect.toUpperCase()) as HTMLElement;
    
    await waitFor(() => user.click(monthElemToSelect));

    const monthSelectables = newStore.getState().timeline.filteredSelectables;
    expect(monthSelectables).not.toBeNull();
    
    // Verify non-overlapped values in << filter/filteredSelectables >>
    // to be disabled with class "unavailable".
    const baseSelectables = newStore.getState().timeline.filterSelectables;
    let buttonsToDisable: Array<string | number | null> = []

    for (let item of Object.entries(baseSelectables!)) {
        const category = item[0];
        const itemList = item[1] as Array<string | number | null>;

        if (monthSelectables !== null) {
            let difference = itemList?.filter(x => 
                !monthSelectables[category]?.includes(x)
            );
            
            // Append non-intersecting values of base/month selectables.
            buttonsToDisable = [...buttonsToDisable, ...difference];
        }
    }

    // Verify "unavailable" class.
    filterButtons.forEach(button => {
        if (buttonsToDisable.includes(button.textContent)) {
            expect(button).toHaveClass("unavailable");
        }
    })
});


test("fetches year's data when going from filters activated to deactivated", async() => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl, { params: { 'year': 2022 } })
        .replyOnce(200, mockDefaultData)
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

    const newStore = setupStore(preloadedStateWithFilter);
    render(
        <Provider store={newStore}>
            <TimelineBar />
            <FilterDrawer />
        </Provider>
    );

    // Verify preloaded state with filters activated.
    expect(newStore.getState().timeline.query).toEqual(
        { year: 2022, tags: [ "Kodak_Gold_200", "Fujifilm_Superia_X-TRA_400" ] }
    );
    const filterState = newStore.getState().filter;
    expect(filterState.film?.length).not.toEqual(0);

    // Mock-set aria-pressed and styling.
    const filterElems = screen.getAllByRole('checkbox', { name: 'filter-drawer-film-item' });
    const filterElemsClicked: Array<HTMLElement> = [];
    
    for (let item of filterState.film!) {
        for (let elem of filterElems) {
            let originalText = item?.replace(/_/g, ' ');
            if (originalText === elem.textContent) {
                filterElemsClicked.push(elem);
            }
        }
    }

    expect(filterElemsClicked.length).toEqual(2);
    for (let elemsClicked of filterElemsClicked) {
        elemsClicked.setAttribute('aria-pressed', 'true');
        elemsClicked.classList.add("active");
    }

    // Click-deactivate filters.
    await waitFor(() => user.click(filterElemsClicked[0]));
    expect(filterElemsClicked[0]).toHaveAttribute('aria-pressed', 'false');
    expect(newStore.getState().filter.film!.length).toEqual(1);

    await waitFor(() => user.click(filterElemsClicked[1]));
    expect(filterElemsClicked[1]).toHaveAttribute('aria-pressed', 'false');
    expect(newStore.getState().filter.film!.length).toEqual(0);


    // Verify deactivating filters manually (not using reset button) triggers current year fetch.
    expect(newStore.getState().timeline.query).toEqual({ year: 2022 });
})
