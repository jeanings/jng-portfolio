import React from 'react';
import { Provider } from 'react-redux';
import { setupStore } from '../../app/store';
import { 
    act,
    cleanup, 
    render, 
    screen, 
    waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import mockDefaultData from '../../utils/mockDefaultData.json';
import mock2015Data from '../../utils/mock2015Data.json';
import mock2022DataJun from '../../utils/mock2022DataJun.json';
import TimelineBar from './TimelineBar';
import { fetchDocs, ImageDocsRequestProps } from './timelineSlice';
import { apiUrl } from '../../app/App';


var mockAxios = new MockAdapter(axios);
const user = userEvent.setup();

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

    test("updates store state with default data", async() => {
        const newStore = setupStore();
        render(
            <Provider store={newStore}>
                <TimelineBar />
            </Provider>
        );
        
        // Confirm initial << timeline.request >> state.
        expect(newStore.getState().timeline.request).toEqual('idle');
        
        // Wait for async thunk to handle response.
        await waitFor(() => {
            // Year selected element should update to most current (default) year.
            expect(newStore.getState().timeline.yearInit).toEqual(2022);
            screen.getByRole('menuitem', { name: 'year-selected' });
            const yearSelectedElem = screen.getByRole('menuitem', { name: 'year-selected' });
            expect(yearSelectedElem).toHaveTextContent('2022');
        });

        // States should update to default fetch values.
        expect(newStore.getState().timeline.yearSelected).toEqual(2022);
        expect(newStore.getState().timeline.request).toEqual('complete');
    });


    /* ---------------------------------------------------
        Tests for year selector elements.
    ----------------------------------------------------*/
    test("renders year selector", () => {
        const newStore = setupStore();
        render(
            <Provider store={newStore}>
                <TimelineBar />
            </Provider>
        );

        expect(screen.getByRole('menubar', { name: 'year-selector' })).toBeInTheDocument();
    });


    test("renders selected year", () => {
        const newStore = setupStore();
        render(
            <Provider store={newStore}>
                <TimelineBar />
            </Provider>
        );

        expect(screen.getByRole('menuitem', { name: 'year-selected' })).toBeInTheDocument();
    });


    test("renders list of selectable years", async() => {
        const newStore = setupStore();
        render(
            <Provider store={newStore}>
                <TimelineBar />
            </Provider>
        );

        // API succesfully called and populated list of selectable years.
        await waitFor(() => {
            expect(newStore.getState().timeline.request).toEqual('complete');
        });

        // Verify correct number of year items to render.
        const yearElems = screen.getAllByRole('menuitemradio', { name: 'year-item'});
        const yearItems = newStore.getState().timeline.years;
        expect(yearElems.length).toEqual(yearItems!.length);
    });

    
    /* ---------------------------------------------------
        Tests for month selector.
    ----------------------------------------------------*/
    test("renders month selector", () => {
        const newStore = setupStore();
        render(
            <Provider store={newStore}>
                <TimelineBar />
            </Provider>
        );

        expect(screen.getByRole('menubar', { name: 'month-selector' })).toBeInTheDocument();
    });


    test("renders list of selectable months", () => {
        const newStore = setupStore();
        render(
            <Provider store={newStore}>
                <TimelineBar />
            </Provider>
        );

        const monthItems = screen.getAllByRole('menuitemradio', { name: 'month-item' });
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
    mockAxios.onGet(apiUrl, { params: { 'year': 'default' } })
        .reply(404, [])
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

    const newStore = setupStore();
    render(
        <Provider store={newStore}>
            <TimelineBar />
        </Provider>
    );

    await waitFor(() => {
        // << timeline.yearInit >> state remains null if fetch unsuccessful.
        expect(newStore.getState().timeline.yearInit).toBeFalsy;
        // << timeline.request >> state changed to 'error' instead of 'idle' or 'complete'.
        expect(newStore.getState().timeline.request).toEqual('error');
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

    const newStore = setupStore();
    render(
        <Provider store={newStore}>
        </Provider>
    );

    // Verify fetchDocs helper function parses strings correctly.
    // In: ["Kodak Gold 200", "Fujifilm Superia X-TRA 400"]
    // Out: "Kodak_Gold_200+Fujifilm_Superia_X-TRA_400"
    const response: AxiosResponse = await fetchDocs(apiUrl, request);
    expect(response.status).toEqual(200);
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
        cleanup;
    });


    test("dispatches action, changes state of selected year and gets new data", async() => {
        const newStore = setupStore();
        render(
            <Provider store={newStore}>
                <TimelineBar />
            </Provider>
        );
        
        // Confirm initial << timeline.request >> state.
        expect(newStore.getState().timeline.request).toEqual('idle');

        // Wait for initial fetch to render year selector items.
        await waitFor(() => screen.findAllByRole('menuitemradio', { name: 'year-item' }));
        const yearElems = screen.getAllByRole('menuitemradio', { name: 'year-item' });

        // Confirm nothing is selected.
        yearElems.forEach(element => {
            expect(element).toHaveAttribute('aria-checked', 'false');
        });

        // Click on a year.
        const yearSelectElem = yearElems.find(element => element.textContent === '2015') as HTMLElement;
        await waitFor(() => user.click(yearSelectElem));

        await waitFor(() => {
            // Clicked element gets checked value and state is updated.
            expect(yearSelectElem).toHaveAttribute('aria-checked', 'true');
            expect(newStore.getState().timeline.request).toEqual('complete');
        });

        // Verify that new image doc has same date year metadata as clicked year.
        expect(newStore.getState().timeline.yearSelected).toEqual(2015);
        expect(newStore.getState().timeline.imageDocs![0].date.year).toEqual(2015);

        // Check screen's year selected element updates to 2015.
        const yearSelectedElem = screen.getByRole('menuitem', { name: 'year-selected' });
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
                    <TimelineBar />
                </Provider>
            );
        });

        expect(newStore.getState().timeline.request).toEqual('idle');

        // Confirm initial << timeline.request >> state.
        act(() => {
            jest.advanceTimersByTime(50);
        });
        await waitFor(() => {
            expect(newStore.getState().timeline.yearInit).toEqual(2022);
            screen.findAllByRole('menuitem', { name: 'year-selected' });
        });

        // Confirm changes.
        const yearSelectedElem = screen.getByRole('menuitem', { name: 'year-selected' });
        expect(yearSelectedElem).toHaveTextContent('2022');
        expect(newStore.getState().timeline.yearSelected).toEqual(2022);
        expect(newStore.getState().timeline.request).toEqual('complete')

        // Wait for initial fetch to render year selector items.
        act(() => {
            jest.advanceTimersByTime(100);
        });
        await waitFor(() => screen.findAllByRole('menuitemradio', { name: 'year-item' }));
        const yearElems = screen.getAllByRole('menuitemradio', { name: 'year-item' });

        // // Get total image count on screen.
        act(() => {
            jest.advanceTimersByTime(50);
        });
        await waitFor(() => screen.findAllByRole('menuitemradio', { name: 'month-item' }));
        const monthElems = screen.getAllByRole('menuitemradio', { name: 'month-item' });

        let allMonthsElem: HTMLElement;
        monthElems.forEach(element => {
            if (element.firstChild!.textContent!.toUpperCase() === 'ALL') {
                allMonthsElem = element;
            }
        });
        const allMonthsElemKey = allMonthsElem!.firstChild!.textContent!.toLowerCase();

        // Confirm total image count of default data set.
        expect(newStore.getState().timeline.counter[allMonthsElemKey]).toEqual(40);

        // Let rolling counts and dispatch actions to finish.
        act(() => {
            jest.advanceTimersByTime(3000);
        });
        await waitFor(() => expect(newStore.getState().timeline.yearSelected).toEqual(2022));

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
        expect(newStore.getState().timeline.yearSelected).toEqual(2015);
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


    test("resets active month element to 'all'", async() => {
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
        
        const newStore = setupStore();
        render(
            <Provider store={newStore}>
                <TimelineBar />
            </Provider>
        );
        
        // Wait for year elements to render.
        await waitFor(() => screen.findAllByRole('menuitemradio', { name: 'year-item' }))
        const yearElems = screen.getAllByRole('menuitemradio', { name: 'year-item' }); 
        const yearItems = mockDefaultData.years.length;
        expect(yearElems.length).toEqual(yearItems);
        expect(yearElems[0]).toBeInTheDocument();

        // Select a month.
        const monthToSelect: string = 'jun';
        const monthElems = screen.getAllByRole('menuitemradio', { name: 'month-item' });
        const monthElemToSelect = monthElems.find(element => 
            element.textContent!.replace(/\d+/, "") === monthToSelect.toUpperCase()) as HTMLElement;

        await waitFor(() => user.click(monthElemToSelect));
            
        // Check for checked and style updates.
        expect(monthElemToSelect).toHaveAttribute('aria-checked', 'true');
        expect(monthElemToSelect).toHaveClass("active");

        // Select a year.
        const yearSelectElem = yearElems.find(element => element.textContent === '2015') as HTMLElement;
        await waitFor(() => user.click(yearSelectElem));
        expect(newStore.getState().timeline.yearSelected).toEqual(2015);

        // Check for checked and style updates.
        const monthAllName: string = 'all';
        const monthElemAll = monthElems.find(element => 
            element.textContent!.replace(/\d+/, "") === monthAllName.toUpperCase()) as HTMLElement;
        
        expect(monthElemAll).toHaveAttribute('aria-checked', 'true');
        expect(monthElemAll).toHaveClass("active");

        // Mocked June element.
        const mockedMonthElemToSelect = mockHTMLCollection[0]; 
        expect(mockedMonthElemToSelect).toHaveAttribute('aria-checked', 'false');
        expect(mockedMonthElemToSelect).not.toHaveClass("active");
    })
});


test("resets << timeline.filteredSelectables >> to null", async() => { 
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
        .onGet(apiUrl, { params: { 'year': 2022 } })
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

    const newStore = setupStore();
    render(
        <Provider store={newStore}>
            <TimelineBar />
        </Provider>
    );
    
    // Wait for year elements to render.
    await waitFor(() => screen.findAllByRole('menuitemradio', { name: 'year-item' }))
    const yearElems = screen.getAllByRole('menuitemradio', { name: 'year-item' });
    const yearItems = mockDefaultData.years.length;
    expect(yearElems.length).toEqual(yearItems);
    expect(yearElems[0]).toBeInTheDocument();

    // Get month to click.
    const monthElems = screen.getAllByRole('menuitemradio', { name: 'month-item' });
    const monthToSelect = 'jun';
    const monthElemToSelect = monthElems.find(element => 
        element.textContent!.replace(/\d+/, "") === monthToSelect.toUpperCase()) as HTMLElement;
    
    await waitFor(() => user.click(monthElemToSelect));

    // Verify succesful fetch.
    expect(newStore.getState().timeline.query).toEqual({ 'year': 2022, 'month': 6 });
    expect(newStore.getState().timeline.filteredSelectables).not.toBeNull();
    expect(monthElemToSelect).toHaveAttribute('aria-checked', 'true');
    
    // Get year to click.
    const yearToSelect = 2022;
    const yearElemToSelect = yearElems.find(element => 
        parseInt(element.textContent!) === yearToSelect) as HTMLElement;

    await waitFor(() => user.click(yearElemToSelect));
    
    // Verify << filteredSelectables >> reset to null.
    expect(newStore.getState().timeline.filteredSelectables).toBeNull();
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
        const newStore = setupStore();
        render(
            <Provider store={newStore}>
                <TimelineBar />
            </Provider>
        );
        
        // Confirm initial << timeline.request >> state.
        expect(newStore.getState().timeline.request).toEqual('idle');

        // Check for all radios to be false.
        const monthElems = screen.getAllByRole('menuitemradio', { name: 'month-item' });

        // Select a month.
        const monthToSelect: string = 'jun';
        const monthElemToSelect = monthElems.find(element => 
            element.textContent!.replace(/\d+/, "") === monthToSelect.toUpperCase()) as HTMLElement;
        
        await waitFor(() => user.click(monthElemToSelect));
        
        // Check for checked and style updates.
        expect(monthElemToSelect).toHaveAttribute('aria-checked', 'true');
        expect(monthElemToSelect).toHaveClass("active");
        // If called, other radios have been reset.
        expect(getElemByClassSpy).toHaveBeenCalled();
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
        const newStore = setupStore();
        render(
            <Provider store={newStore}>
                <TimelineBar />
            </Provider>
        );
        
        // Confirm initial << timeline.request >> state.
        expect(newStore.getState().timeline.request).toEqual('idle');

        // Check for all radios to be false.
        const monthElems = screen.getAllByRole('menuitemradio', { name: 'month-item' });

        // Select a month.
        const monthToSelect: string = 'jun';
        const monthElemToSelect = monthElems.find(element => 
            element.textContent!.replace(/\d+/, "") === monthToSelect.toUpperCase()) as HTMLElement;

        await waitFor(() => user.click(monthElemToSelect));
            
        // Check for checked and style updates.
        expect(monthElemToSelect).toHaveAttribute('aria-checked', 'true');
        expect(monthElemToSelect).toHaveClass("active");
        // If called, other radios have been reset.
        expect(getElemByClassSpy).toHaveBeenCalled();

        // Verify << filteredSelectables >> state is populated.
        expect(newStore.getState().timeline.query?.month).toEqual(6);
        expect(newStore.getState().timeline.filteredSelectables).not.toBeNull();
    });
});
