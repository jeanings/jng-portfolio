import React from 'react';
import { Provider } from 'react-redux';
import { setupStore, RootState } from '../../app/store';
import { 
    act,
    cleanup, 
    render, 
    screen, 
    waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
    MemoryRouter, 
    Route,
    Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import mockDefaultData from '../../utils/mockDefaultData.json';
import mock2015Data from '../../utils/mock2015Data.json';
import mock2022DataJun from '../../utils/mock2022DataJun.json';
import TimelineBar from './TimelineBar';
import FilterDrawer from '../FilterDrawer/FilterDrawer';
import { fetchDocs, ImageDocsRequestProps } from './timelineSlice';
import {apiUrl } from '../../app/App';
import preloadedState from '../../utils/testHelpers';


var mockAxios = new MockAdapter(axios);
const user = userEvent.setup();

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
function renderBoilerplate(preloadedState: RootState | null, components: Array<string>) {
    let newStore = setupStore();
    if (preloadedState) {
        newStore = setupStore(preloadedState);
    }
    
    const container = render(
        <Provider store={newStore}>
            <MemoryRouter>
                <Routes>
                    <Route path='/*' element={ 
                            <>
                                components.includes('timeline')
                                    ? <TimelineBar />
                                    : <></> 
                                components.includes('filter')
                                    ? <FilterDrawer />
                                    : <></> 
                            </>
                        } />
                </Routes>
            </MemoryRouter>
        </Provider>
    );
    return { ...container, newStore };
}


/* =====================================================================
    Tests for initial rendering - async thunk, state-reliant elements.
===================================================================== */
describe("on initial renders", () => {
    beforeEach(() => {
        // Intercept get requests to live API, returning default local data.
        mockAxios = new MockAdapter(axios);
        mockAxios
            .onGet(apiUrl, { params: { 'year': 'default' } })
            .reply(200, mockDefaultData);
    });

    afterEach(() => {
        mockAxios.reset();
        cleanup;
    });


    test("updates store state with default data", async() => {
        const { newStore } = renderBoilerplate(null, ['timeline']);
        
        // Confirm initialization fetch.
        expect(newStore.getState().timeline.responseStatus).toEqual('uninitialized');
        
        // Wait for async thunk to handle response.
        // Year selected element should update to most current (default) year.
        await waitFor(() => expect(newStore.getState().timeline.initYear).toEqual(2022));
        expect(newStore.getState().timeline.responseStatus).toEqual('initialized');
   
        await waitFor(() => screen.getByRole('menuitem', { name: 'selected year' }));
        const yearSelectedElem = screen.getByRole('menuitem', { name: 'selected year' });
        expect(yearSelectedElem).toHaveTextContent('2022');

        // States should update to default fetch values.
        expect(newStore.getState().timeline.selected.year).toEqual(2022);
    });


    /* ---------------------------------------------------
        Tests for year selector elements.
    ----------------------------------------------------*/
    test("renders year selector", () => {
        const { newStore } = renderBoilerplate(preloadedState, ['timeline']);
        expect(screen.getByRole('menubar', { name: 'year selector' })).toBeInTheDocument();
    });


    test("renders selected year", () => {
        const { newStore } = renderBoilerplate(preloadedState, ['timeline']);
        expect(screen.getByRole('menuitem', { name: 'selected year' })).toBeInTheDocument();
    });


    test("renders list of selectable years", async() => {
        const { newStore } = renderBoilerplate(null, ['timeline']);

        // Initial API called successfully and populated list of selectable years.
        await waitFor(() => expect(newStore.getState().timeline.responseStatus).toEqual('initialized'));
        
        // Verify correct number of year items to render.
        const yearElems = screen.getAllByRole('menuitemradio', { name: 'year selector option'});
        const yearItems = newStore.getState().timeline.years;
        expect(yearElems.length).toEqual(yearItems!.length);
    });

    
    /* ---------------------------------------------------
        Tests for month selector.
    ----------------------------------------------------*/
    test("renders month selector", () => {
        const { newStore } = renderBoilerplate(preloadedState, ['timeline']);
        expect(screen.getByRole('menubar', { name: 'month selector' })).toBeInTheDocument();
    });


    test("renders list of selectable months", () => {
        const { newStore } = renderBoilerplate(preloadedState, ['timeline']);
        const monthItems = screen.getAllByRole('menuitemradio', { name: 'month selector option' });
        expect(monthItems.length).toBeGreaterThanOrEqual(13);
    });
});



/* =====================================================================
    Tests for fetch error cases.
===================================================================== */
test("catches fetch request errors", async() => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl, { params: { 'year': 'default' } })
        .reply(404, [])
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

    const { newStore } = renderBoilerplate(null, ['timeline']);

    await waitFor(() => {
        // << timeline.initYear >> state remains null if fetch unsuccessful.
        expect(newStore.getState().timeline.initYear).toBeFalsy;
        // << timeline.responseStatus >> state changed to 'error' instead of 'initialized' or 'successful'.
        expect(newStore.getState().timeline.responseStatus).toEqual('error');
    });
});



/* =====================================================================
    Tests for fetch helper function query string parsing.
===================================================================== */
test("fetcher thunk parses queries into single string", async() => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    const request: ImageDocsRequestProps = {
        'year': 2022,
        'film': [
            "Kodak_Gold_200",
            "Fujifilm Superia X-TRA 400"
        ]
    };

    const fetchRequest = {
        'year': 2022,
        'film': "Kodak_Gold_200+Fujifilm_Superia_X-TRA_400" 
    }

    mockAxios = new MockAdapter(axios);
    mockAxios.onGet(apiUrl, { params: fetchRequest })
        .reply(200, mockDefaultData)
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

    const { newStore } = renderBoilerplate(null, ['timeline']);

    // Verify fetchDocs helper function parses strings correctly.
    // In: ["Kodak Gold 200", "Fujifilm Superia X-TRA 400"]
    // Out: "Kodak_Gold_200+Fujifilm_Superia_X-TRA_400"
    const response: AxiosResponse = await fetchDocs(apiUrl, request);
    await waitFor(() => expect(response.status).toEqual(200));
    expect(response.data).toEqual(mockDefaultData);
});
        

    
/* =====================================================================
    Tests for clicks on menu timeline selection items.
===================================================================== */
describe("clicks on dropdown year selector elements", () => {
    beforeEach(() => {
        // Intercept get requests to live API, returning default local data.
        mockAxios = new MockAdapter(axios);
        mockAxios
            .onGet(apiUrl, { params: { 'year': 'default' } })
            .replyOnce(200, mockDefaultData)
            .onGet(apiUrl, { params: { 'year': 2015 } })
            .replyOnce(200, mock2015Data);
    });

    afterEach(() => {
        mockAxios.reset();
        jest.clearAllMocks();
        jest.restoreAllMocks();
        cleanup;
    });


    test("re-routes, dispatches action, changes state of selected year and gets new data", async() => {
        const { newStore } = renderBoilerplate(null, ['timeline']);

        // Wait for initial fetch to render year selector items.
        await waitFor(() => screen.findAllByRole('menuitemradio', { name: 'year selector option' }));
        const yearElems = screen.getAllByRole('menuitemradio', { name: 'year selector option' });

        expect(newStore.getState().timeline.responseStatus).toEqual('initialized');
        expect(newStore.getState().timeline.selected.year).toEqual(2022);

        // Click on a year.
        const yearSelectElem = yearElems.find(element => element.textContent === '2015') as HTMLElement;
        await user.click(yearSelectElem);
        console.log('aft', newStore.getState().timeline.selected)
        // Clicked element gets checked value and state is updated.
        await waitFor(() => expect(yearSelectElem).toHaveAttribute('aria-checked', 'true'));
        expect(newStore.getState().timeline.responseStatus).toEqual('idle');

        // Verify that new image doc has same date year metadata as clicked year.
        expect(newStore.getState().timeline.selected.year).toEqual(2015);
        expect(newStore.getState().timeline.imageDocs![0].date.year).toEqual(2015);

        // Check screen's year selected element updates to 2015.
        const yearSelectedElem = screen.getByRole('menuitem', { name: 'selected year' });
        expect(yearSelectedElem).toHaveTextContent('2015');
    });


    test("fetching new data updates image counts via rolling counter", async() => {
        /* --------------------------------------------------------
            Mocks                                          start
        -------------------------------------------------------- */
        // Mocked Axios calls.
        mockAxios = new MockAdapter(axios);
        mockAxios
            .onGet(apiUrl, { params: { 'year': 'default' } })
            .replyOnce(200, mockDefaultData)
            .onGet(apiUrl, { params: { 'year': 2015 } })
            .replyOnce(200, mock2015Data);

        // Faked timers.
        jest.useFakeTimers();
        /* --------------------------------------------------------
            Mocks                                            end
        -------------------------------------------------------- */
        
        const newStore = setupStore();
        act(() => {
            render(
                <Provider store={newStore}>
                    <MemoryRouter>
                        <TimelineBar />
                    </MemoryRouter>
                </Provider>
            );
        });
        // Confirm initialization fetch.
        expect(newStore.getState().timeline.responseStatus).toEqual('uninitialized');
        await waitFor(() => expect(newStore.getState().timeline.responseStatus).toEqual('initialized'));

        act(() => {
            jest.advanceTimersByTime(100);
        });

        await waitFor(() => expect(newStore.getState().timeline.initYear).toEqual(2022));
        await waitFor(() => screen.findAllByRole('menuitem', { name: 'selected year' }));

        // Wait for counters to roll.
        act(() => {
            jest.advanceTimersByTime(300);
        });

        // Confirm init year updated for UI year elements.
        const yearSelectedElem = screen.getByRole('menuitem', { name: 'selected year' });
        expect(yearSelectedElem).toHaveTextContent('2022');
        expect(newStore.getState().timeline.selected.year).toEqual(2022);

        // Wait for initial fetch to render year selector items.
        await waitFor(() => screen.findAllByRole('menuitemradio', { name: 'year selector option' }));
        const yearElems = screen.getAllByRole('menuitemradio', { name: 'year selector option' });

        // Get total image count on screen.
        await waitFor(() => screen.findAllByRole('menuitemradio', { name: 'month selector option' }));
        const monthElems = screen.getAllByRole('menuitemradio', { name: 'month selector option' });

        // Get total images count element.
        const allMonthsElem: HTMLElement = monthElems.filter(element => 
            element.firstChild!.textContent!.toUpperCase() === 'ALL')[0];
        const allMonthsElemKey = allMonthsElem!.firstChild!.textContent!.toLowerCase();

        // Confirm total image count of default data set.
        expect(newStore.getState().timeline.counter[allMonthsElemKey]).toEqual(40);

        // Let rolling counts and dispatch actions to finish.
        act(() => {
            jest.advanceTimersByTime(5000);
        });
        await waitFor(() => expect(newStore.getState().timeline.selected.year).toEqual(2022));

        // Verify default counts to be equal after rolling counters end.
        await waitFor(() => {
            let countFromState = newStore.getState().timeline.counter[allMonthsElemKey];
            expect(countFromState).toEqual(40);     // Image count for default data.
            expect(parseInt(allMonthsElem!.lastChild!.textContent as string)).toEqual(countFromState);
            expect(newStore.getState().timeline.counter.previous[allMonthsElemKey]).toEqual(countFromState);
        });

        // Click on a year.
        const yearSelectElem = yearElems.find(element => element.textContent === '2015') as HTMLElement;
        await waitFor(() => user.click(yearSelectElem));
        
        // Wait for fetch.
        act(() => {
            jest.advanceTimersByTime(100);
        });
        
        // Verify << timeline >> state update.
        expect(newStore.getState().timeline.selected.year).toEqual(2015);
        expect(newStore.getState().timeline.counter[allMonthsElemKey]).toEqual(59);

        // Let rolling counts and dispatch actions to finish.
        act(() => {
            jest.advanceTimersByTime(3000);
        });

        // Verify final count on screen equals to << timeline.counter >> and updates 
        // << timeline.counter.previous >> so the next fetch will roll the count from those numbers.
        await waitFor(() => {
            let countFromState = newStore.getState().timeline.counter[allMonthsElemKey];
            expect(countFromState).toEqual(59);     // Image count for 2015 data.
        });

        let countFromState = newStore.getState().timeline.counter[allMonthsElemKey];
        expect(parseInt(allMonthsElem!.lastChild!.textContent as string)).toEqual(countFromState);
        expect(newStore.getState().timeline.counter.previous[allMonthsElemKey]).toEqual(countFromState);

        jest.useRealTimers();
    });


    test("(on different year select) resets active month element to 'all'", async() => {
        /* --------------------------------------------------------
            Mocks                                          start
        -------------------------------------------------------- */
        // Mocked Axios calls.
        mockAxios = new MockAdapter(axios);
        mockAxios
            .onGet(apiUrl, { params: { 'year': 'default' } })
            .replyOnce(200, mockDefaultData)
            .onGet(apiUrl, { params: { 'year': 2015 } })
            .replyOnce(200, mock2015Data);

        // Mocked document methods.
        // Mock HTML collection.
        const mockMonthElem = document.createElement('div');
        let docFragment = document.createDocumentFragment();
        docFragment.appendChild(mockMonthElem);
        const mockHTMLCollection = docFragment.children;

        const getElemByClassSpy = jest.spyOn(document, "getElementsByClassName");
        getElemByClassSpy.mockReturnValue(mockHTMLCollection);
        /* --------------------------------------------------------
            Mocks                                            end
        -------------------------------------------------------- */
        
        const { newStore } = renderBoilerplate(null, ['timeline', 'filter']);
        
        // Wait for year elements to render.
        await waitFor(() => screen.findAllByRole('menuitemradio', { name: 'year selector option' }))
        const yearElems = screen.getAllByRole('menuitemradio', { name: 'year selector option' }); 
        const yearItems = mockDefaultData.years.length;
        expect(yearElems.length).toEqual(yearItems);
        expect(yearElems[0]).toBeInTheDocument();

        // Select a month.
        const monthToSelect: string = 'jun';
        const monthElems = screen.getAllByRole('menuitemradio', { name: 'month selector option' });
        const monthElemToSelect = monthElems.find(element => 
            element.textContent!.replace(/\d+/, "") === monthToSelect.toUpperCase()) as HTMLElement;

        await user.click(monthElemToSelect);
            
        // Check for checked and style updates.
        expect(monthElemToSelect).toHaveAttribute('aria-checked', 'true');
        expect(monthElemToSelect).toHaveClass("active");

        // Select a year.
        const yearSelectElem = yearElems.find(element => element.textContent === '2015') as HTMLElement;
        await user.click(yearSelectElem);
        expect(newStore.getState().timeline.selected.year).toEqual(2015);

        // Check for checked and style updates.
        const monthAllName: string = 'all';
        const monthElemAll = monthElems.find(element => 
            element.textContent!.replace(/\d+/, "") === monthAllName.toUpperCase()) as HTMLElement;
        
        expect(newStore.getState().timeline.selected.month).toEqual(monthAllName);
        expect(monthElemAll).toHaveAttribute('aria-checked', 'true');
        expect(monthElemAll).toHaveClass("active");
    });


    test("(on different year select) resets << timeline.filteredSelectables >> to null", async() => { 
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
            .onGet(apiUrl, { params: { 'year': 2015 } })
            .replyOnce(200, mockDefaultData);
    
        // Mocked document methods.
        // Mock HTML collection.
        const mockMonthElem = document.createElement('div');
        let docFragment = document.createDocumentFragment();
        docFragment.appendChild(mockMonthElem);
        const mockHTMLCollection = docFragment.children;
    
        const getElemByClassSpy = jest.spyOn(document, "getElementsByClassName");
        getElemByClassSpy.mockReturnValue(mockHTMLCollection);
        /* --------------------------------------------------------
            Mocks                                            end
        -------------------------------------------------------- */
    
        const { newStore } = renderBoilerplate(null, ['timeline', 'filter']);
        
        // Wait for year elements to render.
        await waitFor(() => screen.findAllByRole('menuitemradio', { name: 'year selector option' }))
        const yearElems = screen.getAllByRole('menuitemradio', { name: 'year selector option' });
        const yearItems = mockDefaultData.years.length;
        expect(yearElems.length).toEqual(yearItems);
        expect(yearElems[0]).toBeInTheDocument();
    
        // Get month to click.
        const monthElems = screen.getAllByRole('menuitemradio', { name: 'month selector option' });
        const monthToSelect = 'jun';
        const monthElemToSelect = monthElems.find(element => 
            element.textContent!.replace(/\d+/, "") === monthToSelect.toUpperCase()) as HTMLElement;
        
        await user.click(monthElemToSelect);
    
        // Verify succesful fetch.
        expect(newStore.getState().timeline.query).toEqual({ 'year': 2022, 'month': 6 });
        expect(newStore.getState().timeline.filteredSelectables).not.toBeNull();
        expect(monthElemToSelect).toHaveAttribute('aria-checked', 'true');
        
        // Get year to click.
        const yearToSelect = 2015;
        const yearElemToSelect = yearElems.find(element => 
            parseInt(element.textContent!) === yearToSelect) as HTMLElement;
    
        await user.click(yearElemToSelect);
        
        // Verify << filteredSelectables >> reset to null.
        expect(newStore.getState().timeline.selected.month).toEqual('all');
        await waitFor(() => expect(newStore.getState().timeline.filteredSelectables).toBeNull());
    });
});


describe("clicks on month selector elements", () => {
    beforeEach(() => {
        // Intercept get requests to live API, returning default local data.
        mockAxios = new MockAdapter(axios);
        mockAxios
            .onGet(apiUrl, { params: { 'year': 'default' } })
            .replyOnce(200, mockDefaultData)
            .onGet(apiUrl, { params: { 'year': 2022, 'month': 6 } })
            .replyOnce(200, mock2022DataJun);
    });

    afterEach(() => {
        mockAxios.reset();
        cleanup;
    });
    
    test("updates clicked month's element style", async() => {
        /* --------------------------------------------------------
            Mocks                                          start
        -------------------------------------------------------- */
        // Mocked document methods.
        // Mock HTML collection.
        const mockMonthElem = document.createElement('div');
        let docFragment = document.createDocumentFragment();
        docFragment.appendChild(mockMonthElem);
        const mockHTMLCollection = docFragment.children;

        const getElemByClassSpy = jest.spyOn(document, "getElementsByClassName");
        getElemByClassSpy.mockReturnValue(mockHTMLCollection);
        /* --------------------------------------------------------
            Mocks                                            end
        -------------------------------------------------------- */
        const { newStore } = renderBoilerplate(null, ['timeline']);
        
        // Confirm initialization fetch.
        expect(newStore.getState().timeline.responseStatus).toEqual('uninitialized');
        await waitFor(() => expect(newStore.getState().timeline.responseStatus).toEqual('initialized'));

        // Check for all radios to be false.
        const monthElems = screen.getAllByRole('menuitemradio', { name: 'month selector option' });

        // Select a month.
        const monthToSelect: string = 'jun';
        const monthElemToSelect = monthElems.find(element => 
            element.textContent!.replace(/\d+/, "") === monthToSelect.toUpperCase()) as HTMLElement;
        
        await user.click(monthElemToSelect);
        expect(newStore.getState().timeline.selected.month).toEqual(monthToSelect);

        // Check for checked and style updates.
        expect(monthElemToSelect).toHaveAttribute('aria-checked', 'true');
        expect(monthElemToSelect).toHaveClass("active");
    });


    test("dispatches fetch request for selected month only", async() => {
        /* --------------------------------------------------------
            Mocks                                          start
        -------------------------------------------------------- */
        // Mocked document methods.
        // Mock HTML collection.
        const mockMonthElem = document.createElement('div');
        let docFragment = document.createDocumentFragment();
        docFragment.appendChild(mockMonthElem);
        const mockHTMLCollection = docFragment.children;

        const getElemByClassSpy = jest.spyOn(document, "getElementsByClassName");
        getElemByClassSpy.mockReturnValue(mockHTMLCollection);
        /* --------------------------------------------------------
            Mocks                                            end
        -------------------------------------------------------- */
        const { newStore } = renderBoilerplate(null, ['timeline']);

        // Confirm initialization fetch.
        expect(newStore.getState().timeline.responseStatus).toEqual('uninitialized');
        await waitFor(() => expect(newStore.getState().timeline.responseStatus).toEqual('initialized'));

        // Check for all radios to be false.
        const monthElems = screen.getAllByRole('menuitemradio', { name: 'month selector option' });

        // Select a month.
        const monthToSelect: string = 'jun';
        const monthElemToSelect = monthElems.find(element => 
            element.textContent!.replace(/\d+/, "") === monthToSelect.toUpperCase()) as HTMLElement;

        await user.click(monthElemToSelect);
        
        expect(newStore.getState().timeline.selected.month).toEqual(monthToSelect);

        // Check for checked and style updates.
        expect(monthElemToSelect).toHaveAttribute('aria-checked', 'true');
        expect(monthElemToSelect).toHaveClass("active");
   
        // Verify << filteredSelectables >> state is populated.
        expect(newStore.getState().timeline.query?.month).toEqual(6);
        expect(newStore.getState().timeline.filteredSelectables).not.toBeNull();
    });
});
