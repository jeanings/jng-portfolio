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
import TimelineBar from './TimelineBar';


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

    test("updates store state with default data", async() => {
        const newStore = setupStore();
        render(
            <Provider store={newStore}>
                <TimelineBar />
            </Provider>
        );
        
        // Confirm initial << timeline.request >> state.
        expect(newStore.getState().timeline.request).toBe('idle');
        
        // Wait for async thunk to handle response.
        await waitFor(() => {
            // Year selected element should update to most current (default) year.
            expect(newStore.getState().timeline.yearInit).toBe(2022);
            screen.getByRole('menuitem', { name: 'year-selected' });
            const yearSelectedElem = screen.getByRole('menuitem', { name: 'year-selected' });
            expect(yearSelectedElem).toHaveTextContent('2022');

            // States should update to default fetch values.
            expect(newStore.getState().timeline.yearSelected).toBe(2022);
            expect(newStore.getState().timeline.request).toBe('complete');
        });
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
            expect(newStore.getState().timeline.request).toBe('complete');
            const yearElems = screen.getAllByRole('menuitemradio', { name: 'year-item'});
            expect(yearElems.length).toBeGreaterThanOrEqual(1);
        });
        
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
        expect(monthItems.length).toBeGreaterThanOrEqual(12);
    });
});



/* =====================================================================
    Tests for fetch error cases.
===================================================================== */
test("catches fetch request errors", async() => {
    mockAxios = new MockAdapter(axios);
    mockAxios.onGet(apiUrl, { params: { 'year': 'default' } })
        .reply(404, [])

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
        expect(newStore.getState().timeline.request).toBe('error');
    });
});
        

    
/* =====================================================================
    Tests for clicks on menu timeline selection items.
===================================================================== */
describe("clicks on year drawer items", () => {
    beforeEach(() => {
         // Intercept get requests to live API, returning default local data.
        mockAxios = new MockAdapter(axios);
        mockAxios
            .onGet(apiUrl, { params: { 'year': 'default' } })
            .replyOnce(200, mockDefaultData)
            .onGet(apiUrl, { params: { 'year': 2015 } })
            .reply(200, mock2015Data)
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
        expect(newStore.getState().timeline.request).toBe('idle');

        await waitFor(() => {
            // Wait for initial fetch to render year selector items.
            screen.findAllByRole('menuitemradio', { name: 'year-item' });
            const yearElems = screen.getAllByRole('menuitemradio', { name: 'year-item' });

            // Confirm nothing is selected.
            yearElems.forEach(element => {
                expect(element).toHaveAttribute('aria-checked', 'false');
            });

            // Click on a year.
            const yearSelectElem = yearElems.find(element => element.textContent === '2015') as HTMLElement;
            fireEvent.click(yearSelectElem)

            // Clicked element gets checked value and state is updated.
            expect(yearSelectElem.ariaChecked).toEqual('true');
            expect(newStore.getState().timeline.request).toBe('complete');
            expect(newStore.getState().timeline.yearSelected).toBe(2015);

            // Verify that new image doc has same date year metadata as clicked year.
            expect(newStore.getState().timeline.imageDocs![0].date.year).toBe(2015);

            // Check screen's year selected element updates to 2015.
            const yearSelectedElem = screen.getByRole('menuitem', { name: 'year-selected' });
            expect(yearSelectedElem).toHaveTextContent('2015');
        });
    });
});


describe("clicks on month selector items", () => {
    beforeEach(() => {
         // Intercept get requests to live API, returning default local data.
        mockAxios = new MockAdapter(axios);
        mockAxios
            .onGet(apiUrl, { params: { 'year': 'default' } })
            .replyOnce(200, mockDefaultData)
        jest.useFakeTimers();

    });

    afterEach(() => {
        mockAxios.reset();
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
        cleanup;
    });
    
    test("dispatches to change selected month, updates element style", async() => {
        const newStore = setupStore();
        render(
            <Provider store={newStore}>
                <TimelineBar />
            </Provider>
        );
        
        // Confirm initial << timeline.request >> state.
        expect(newStore.getState().timeline.request).toBe('idle');

        // Check for all radios to be false.
        const monthSelectorElems = screen.getAllByRole('menuitemradio', { name: 'month-item' });

        // Select a month.
        const monthToSelect: string = 'all';
        const monthElemToSelect = monthSelectorElems.find(element => 
            element.textContent!.replace(/\d/, "") === monthToSelect.toUpperCase()) as HTMLElement;
        fireEvent.click(monthElemToSelect);
            
        monthSelectorElems.forEach(element => {
            // Check for radios and aria-checked to be reset. 
            if (element !== monthElemToSelect) {
                expect(element).toHaveAttribute('aria-checked', 'false');
                expect(element).not.toHaveClass("active");
            }
        });

        // Check for checked and style updates to counter.
        expect(monthElemToSelect.ariaChecked).toEqual('true');
        expect(monthElemToSelect).toHaveClass("active");

        await waitFor(() => {
            // Updates << timeline.month >> state correctly.
            expect(newStore.getState().timeline.month).toBe(monthToSelect);
            expect(newStore.getState().timeline.request).toBe('complete');
        });

        // Let rolling counts finish, plus dispatch updates to previous counter state.
        act(() => {
            jest.advanceTimersByTime(2500);
        });

        const countFromState = newStore.getState().timeline.counter![monthToSelect] as number;
        const countFromPrevState = newStore.getState().timeline.counter.previous![monthToSelect] as number;
        const countFromElem: number = parseInt(monthElemToSelect.lastChild!.textContent as string);
        // Verify final count on screen equals to << timeline.counter >> and updates 
        // << timeline.counter.previous >> so the next fetch  will roll the count from those numbers.
        expect(countFromElem).toEqual(countFromState);
        expect(countFromPrevState).toEqual(countFromState);
    });
});






    