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
import mock2022DataJun from '../../utils/mock2022DataJun.json';
import mock2015Data from '../../utils/mock2015Data.json';
import preloadedState from '../../utils/testHelpers';
import TimelineBar from '../TimelineBar/TimelineBar';
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


/* --------------------------------------
    Boilerplate for rendering document.
-------------------------------------- */
function renderBoilerplate(preloadedState: RootState, components: Array<string>) {
    const newStore = setupStore(preloadedState);
    const container = render(
        <Provider store={newStore}>
            { components.includes('timeline')
                ? <TimelineBar />
                : <></> }
            { components.includes('filter')
                ? <FilterDrawer />
                : <></> }
        </Provider>
    );
    return { ...container, newStore };
}


/* =====================================================================
    Tests for initial rendering - async thunk, state-reliant elements.
===================================================================== */
test("renders groups of filter options on initial load", async() => {
    const { newStore } = renderBoilerplate(preloadedState, ['filter']);

    // Verify correct number of filter buttons rendered.
    await waitFor(() => screen.findAllByRole('checkbox'));

    const formatButtons = screen.getAllByRole('checkbox', { name: 'format filter option'});
    expect(formatButtons.length).toEqual(2);

    const filmButtons = screen.getAllByRole('checkbox', { name: 'film filter option'});
    expect(filmButtons.length).toEqual(2);

    const cameraButtons = screen.getAllByRole('checkbox', { name: 'camera filter option'});
    expect(cameraButtons.length).toEqual(2);

    const lensButtons = screen.getAllByRole('checkbox', { name: 'lens filter option'});
    expect(lensButtons.length).toEqual(2);

    const focalLengthButtons = screen.getAllByRole('checkbox', { name: 'focalLength filter option'});
    expect(focalLengthButtons.length).toEqual(1);

    const tags = screen.getAllByRole('checkbox', { name: 'tags filter option'});
    expect(tags.length).toEqual(36);
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
        { category: 'format', ariaLabel: 'format filter option' },
        { category: 'film', ariaLabel: 'film filter option' },
        { category: 'camera', ariaLabel: 'camera filter option' },
        { category: 'lens', ariaLabel: 'lens filter option' },
        { category: 'focalLength', ariaLabel: 'focalLength filter option' },
        { category: 'tags', ariaLabel: 'tags filter option' },
    ];

    filterCategories.map(group => {
        test(`adds selected filter (${group['category']}) to existing array in state`, async() => {
            /* --------------------------------------------------------
                Mocks                                          start
            -------------------------------------------------------- */
            // Mocked Axios calls.
            mockAxios = new MockAdapter(axios);
            mockAxios
                .onGet(apiUrl, { params: { 'year': 'default' } })
                .replyOnce(200, mock2022Data)
                .onGet(apiUrl, { params: { 'year': 2022, 'format-medium': 'film' } })
                .replyOnce(200, mock2022Data)
                .onGet(apiUrl, { params: { 'year': 2022, 'format-type': '35mm' } })
                .replyOnce(200, mock2022Data)
                .onGet(apiUrl, { params: { 'year': 2022, 'focal-length': '50' } })
                .replyOnce(200, mock2022Data)
            /* --------------------------------------------------------
                Mocks                                            end
            -------------------------------------------------------- */

            const { newStore } = renderBoilerplate(preloadedState, ['filter']);
    
            // Verify correct number of filter buttons rendered.
            const filterButtons = screen.getAllByRole('checkbox', { name: group.ariaLabel});
    
            // Verify filter button to not be checked.
            const filterButtonToClick: HTMLElement = filterButtons[0];
            expect(filterButtonToClick.getAttribute('aria-checked')).toEqual('false');

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
            await user.click(filterButtonToClick);
            await waitFor(() => expect(filterButtonToClick.getAttribute('aria-checked')).toEqual('true'));


            // ----------------- Same logic as in switch cases of FilterButton START -----------------
            // Verify text of selected element matches newly added array element.
            if (group.category === 'format') {
                if (filterButtonText === 'film' || filterButtonText === 'digital') {
                    expect(newStore.getState().filter[group.category.concat('Medium')]).toContain(filterButtonText);
                    expect(newStore.getState().timeline.query).toHaveProperty('format-medium');
                }
                else {
                    expect(newStore.getState().filter[group.category.concat('Type')]).toContain(filterButtonText);
                    expect(newStore.getState().timeline.query).toHaveProperty('format-type');
                }
            }
            else if (group.category === 'camera') {
                const make: string = (filterButtonText! as string).split(' ', 1)[0];
                const modelString: string = (filterButtonText! as string)
                    .split(' ')
                    .filter(model => !model.includes(make))
                    .join(' ');
                expect(newStore.getState().filter[group.category]).toContain(modelString);
            }
            else if (group.category === 'focalLength') {
                expect(newStore.getState().timeline.query).toHaveProperty('focal-length');
            }
            else {
                expect(newStore.getState().filter[group.category]).toContain(filterButtonText);
            }
            // ----------------- Same logic as in switch cases of FilterButton END -----------------
        });

   
        test(`removes selected filter (${group['category']}) from existing array in state`, async() => {
            const { newStore } = renderBoilerplate(preloadedState, ['filter']);

            // Verify initial empty state.
            await waitFor(() => screen.findAllByRole('checkbox', { name: group.ariaLabel }));
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
                const modelString: string = (filterButtonToClick.textContent! as string)
                    .split(' ')
                    .filter(model => !model.includes(make))
                    .join(' ');

                filterButtonText = modelString;
            }
            else {
                stateKey = group.category;
                filterButtonText = filterButtonToClick.textContent as string;
            }
            // ----------------- Same logic as in switch cases of FilterButton END -----------------

            // Mock checked status. 
            filterButtonToClick.setAttribute('aria-checked', 'true');

            await waitFor(() => {
                newStore.dispatch(addFilter({ [stateKey]: filterButtonText }));
                expect(filterButtonToClick.getAttribute('aria-checked')).toEqual('true');
                expect(newStore.getState().filter[stateKey]).toContain(filterButtonText);
            });

            // Simulate click on "checked" filter button.
            await user.click(filterButtonToClick);

            // Verify filter is removed from state.
            await waitFor(() => {
                expect(filterButtonToClick.getAttribute('aria-checked')).toEqual('false');
                expect(newStore.getState().filter[stateKey]).not.toContain(filterButtonText);
            });
        });
    });


    test("clicks on reset button clears all filters", async() => {
        const { newStore } = renderBoilerplate(preloadedState, ['filter']);
    
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
            button.setAttribute('aria-checked', 'true');
            let filterName = button.textContent as string;
            let filterType = '';

            for (let option of Object.entries(buttonsCategory)) {
                if (filterName === option[1]) {
                    filterType = option[0]
                }
            }
            
            let payload = { [filterType]: filterName };
            newStore.dispatch(addFilter(payload));
            await waitFor(() => expect(newStore.getState().filter[filterType]).toContain(filterName));
        };

        // Click reset button
        const resetButton = screen.getByRole('button', { name: 'reset filters' })
        expect(resetButton).toBeInTheDocument();
        await user.click(resetButton);
    
        for (let option of Object.entries(buttonsCategory)) {
            await waitFor(() => expect(newStore.getState().filter[option[0]]).not.toContain(option[1]));
        }
    });


    test("grey-out reset button if no filters selected", async() => {
        const { newStore } = renderBoilerplate(preloadedState, ['filter']);

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
        
        filterButtonToClick.setAttribute('aria-checked', 'true');
        let filterType = Object.keys(buttonsCategory)[0];
        let filterName = Object.values(buttonsCategory)[0];        
        let payload = { [filterType]: filterName };
        newStore.dispatch(addFilter(payload));

        await waitFor(() => expect(newStore.getState().filter[filterType]).toContain(filterName));
        
        const resetButton = screen.getByRole('button', { name: 'reset filters' })
        expect(resetButton).toBeInTheDocument();

        // Verify reset button not greyed out.
        expect(resetButton).not.toHaveClass("unavailable");

        // Click reset button.
        await user.click(resetButton);
        
        // Verify reset button greyed out.
        await waitFor(() => expect(resetButton).toHaveClass("unavailable"));
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
        .onGet(apiUrl, { params: { 'year': 'default' } })
        .replyOnce(200, mockDefaultData)
        .onGet(apiUrl, { params: { 'year': 2015 } })
        .replyOnce(200, mock2015Data)
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */
    
    const { newStore } = renderBoilerplate(preloadedState, ['filter', 'timeline']);

    // Verify filter state is blank.
    expect(newStore.getState().timeline.responseStatus).toEqual('successful');
    expect(newStore.getState().filter.film.length).toEqual(0);

    // Wait for elements to render.
    await waitFor(() => screen.findAllByRole('menuitemradio', { name: 'year selector option'}));
    const yearElems = screen.getAllByRole('menuitemradio', { name: 'year selector option' });
    const filterButtons = screen.getAllByRole('checkbox');

    // Mock-click a filter button.
    const buttonsCategory: object = {
        'film': 'Kodak Gold 200',
    };
    let filterButtonToClick = filterButtons.filter(button => 
        Object.values(buttonsCategory).includes(button.textContent as string))[0];
    
    filterButtonToClick.setAttribute('aria-checked', 'true');
    let filterType = Object.keys(buttonsCategory)[0];
    let filterName = Object.values(buttonsCategory)[0];        
    let payload = { [filterType]: filterName };
    newStore.dispatch(addFilter(payload));

    // Verify filter state isn't blank.
    await waitFor(() => expect(newStore.getState().filter.film!.length).not.toEqual(0));

    // Click on a year.
    const yearSelectElem = yearElems.find(element => element.textContent === '2015') as HTMLElement;
    await user.click(yearSelectElem);

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
        .onGet(apiUrl, { params: { 'year': 2022, 'film': 'Kodak_Gold_200' } })
        .replyOnce(200, mock2022Data)
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

    const { newStore } = renderBoilerplate(preloadedState, ['filter', 'timeline']);
        
    // Verify number of docs for initial fetch request.
    await waitFor(() => expect(newStore.getState().timeline.responseStatus).toEqual('successful'));
    await waitFor(() => expect(newStore.getState().timeline.counter.all).toEqual(40));

    await waitFor(() => screen.findAllByRole('checkbox', { name: "film filter option" }));
    const filterButtons = screen.getAllByRole('checkbox', { name: "film filter option" });

    expect(newStore.getState().filter.film).not.toContain('Kodak Gold 200');

    // Get film filter button element to click.
    let filterButtonToClick = filterButtons.filter(button => button.textContent === 'Kodak Gold 200')[0];
    await user.click(filterButtonToClick);
    
    await waitFor(() => expect(newStore.getState().timeline.responseStatus).toEqual('successful'));
    expect(newStore.getState().filter.film).toContain('Kodak Gold 200');
    
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

    const { newStore } = renderBoilerplate(preloadedState, ['filter', 'timeline']);
    
    // Verify all filter buttons are enabled.
    const filterButtons = screen.getAllByRole('checkbox');
    filterButtons.forEach((button) => {
        expect(button).not.toHaveClass("unavailable");
    });

    // Select a month.
    const monthToSelect: string = 'jun';
    const monthElems = screen.getAllByRole('menuitemradio', { name: 'month selector option' });
    const monthElemToSelect = monthElems.find(element => 
        element.textContent!.replace(/\d+/, "") === monthToSelect.toUpperCase()) as HTMLElement;
    
    await user.click(monthElemToSelect);

    const monthSelectables = newStore.getState().timeline.filteredSelectables;
    await waitFor(() => expect(monthSelectables).not.toBeNull());
    
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
        .onGet(apiUrl, { params: { 'year': 'default' } })
        .replyOnce(200, mockDefaultData)
        .onGet(apiUrl, { params: { 'year': 2022, 'film': 'Kodak_Gold_200' } })
        .replyOnce(200, mock2022Data)
        .onGet(apiUrl, { params: { 'year': 2022 } })
        .reply(200, mockDefaultData)
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

    const { newStore } = renderBoilerplate(preloadedState, ['filter', 'timeline']);

    await waitFor(() => expect(newStore.getState().timeline.responseStatus).toEqual('successful'));
    expect(newStore.getState().filter.film.length).toEqual(0);

    await waitFor(() => screen.findAllByRole('checkbox', { name: "film filter option" }));
    const filterButtonsForFilm = screen.getAllByRole('checkbox', { name: "film filter option" });
    expect(newStore.getState().filter.film).not.toContain('Kodak Gold 200');

    // Get film filter button element to click.
    let filterButtonToClick = filterButtonsForFilm.filter(button => button.textContent === 'Kodak Gold 200')[0];
    await user.click(filterButtonToClick);
    
    await waitFor(() => expect(newStore.getState().timeline.responseStatus).toEqual('successful'));
    expect(newStore.getState().filter.film).toContain('Kodak Gold 200');

    // Verify query state updated.
    expect(newStore.getState().timeline.query).toEqual({
        year: 2022,
        film: [ 'Kodak Gold 200']
    });

    // Re-click previous filter button to deactivate filter.
    await user.click(filterButtonToClick);
    await waitFor(() => expect(filterButtonToClick).toHaveAttribute('aria-checked', 'false'));
    expect(newStore.getState().filter.film).not.toContain('Kodak Gold 200');

    // Verify deactivating filters manually (not using reset button) triggers current year fetch.
    await waitFor(() => expect(newStore.getState().timeline.query).toEqual({ 'year': 2022 }));
})
