import React from 'react';
import { useDispatch, useSelector, Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { store } from '../../store';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { faker } from '@faker-js/faker';
import TimelineBar from './TimelineBar';


/* ---------------------------------------------------
    Tests for year selector
----------------------------------------------------*/
test("renders year selector", () => {
    render(
        <Provider store={store}>
            <TimelineBar />
        </Provider>
    );

    expect(screen.getByRole('menubar', { name: 'year-selector' })).toBeInTheDocument();
});


test("renders selected year", () => {
    render(
        <Provider store={store}>
            <TimelineBar />
        </Provider>
    );

    expect(screen.getByRole('menuitem', { name: 'year-selected' })).toBeInTheDocument();
});


test("renders list of selectable years", () => {
    render(
        <Provider store={store}>
            <TimelineBar />
        </Provider>
    );

    const yearSelectorItems = screen.getAllByRole('menuitemradio');
    expect(yearSelectorItems.length).toBeGreaterThanOrEqual(1);     // *** refactor when using API
})


describe("clicks on year drawer items", () => {
    // afterAll(() => {
    //     cleanup();
    // });

    test("dispatches action to change state of selected year", async() => {
        render(
            <Provider store={store}>
                <TimelineBar />
            </Provider>
        );

        // Check for all radios to be false.
        const yearItems = screen.getAllByRole('menuitemradio', { name: 'year-item' });
        yearItems.forEach(element => {
            expect(element).toHaveAttribute('aria-checked', 'false');
        });

        // Select a year.
        const yearSelection = yearItems.find(element => element.textContent === '2015') as HTMLElement;
        fireEvent.click(yearSelection);

         // Check for aria-checked status.
        await expect(yearSelection.ariaChecked).toEqual(true);

        // Check for dispatch.
        await expect(store.getState().timeline.year).toBe('2015');
    });

    // test("changes selected year text", async() => {
    //     render(
    //         <Provider store={store}>
    //             <TimelineBar />
    //         </Provider>
    //     );
            
    //     const yearItems = screen.getAllByRole('menuitemradio', { name: 'year-item' });
        
    //     // Select a year.
    //     const yearSelection = yearItems.find(element => element.textContent === '2015') as HTMLElement;
    //     fireEvent.click(yearSelection);
    
    //     // Check for actual change in selected year.
    //     const yearSelected = screen.getByRole('menuitem', { name: 'year-selected' });
    //     await waitFor(() => 
    //         expect(yearSelected).toHaveTextContent('2015')
    //     );
    // });
});



/* ---------------------------------------------------
    Tests for month selector
----------------------------------------------------*/
test("renders month selector", () => {
    render(
        <Provider store={store}>
            <TimelineBar />
        </Provider>
    );

    expect(screen.getByRole('menubar', { name: 'month-selector' })).toBeInTheDocument();
});


test("renders list of selectable months", () => {
    render(
        <Provider store={store}>
            <TimelineBar />
        </Provider>
    );

    const monthItems = screen.getAllByRole('menuitemradio', { name: 'month-item' });
    expect(monthItems.length).toBeGreaterThanOrEqual(13);
});


describe("clicks on month items", () => {
    afterAll(() => {
        cleanup();
    });

    test("changes and highlights month on click", async() => {
        render(
            <Provider store={store}>
                <TimelineBar />
            </Provider>
        );
    
        // Check for all radios to be false.
        const monthItems = screen.getAllByRole('menuitemradio', { name: 'month-item' });
        monthItems.forEach(element => {
            expect(element).toHaveAttribute('aria-checked', 'false');
        });
    
        // Select a month.
        const monthSelection = monthItems.find(
            element => element.textContent!.replace(/\d/, "") === 'JAN') as HTMLElement;
        fireEvent.click(monthSelection);
    
        // Check for aria-checked status.
        expect(monthSelection.ariaChecked).toEqual(true);
    
        // Check for selected month highlight.
        await waitFor(() => 
            expect(monthSelection).toHaveClass('active')
        );
    });

    test("dispatches action to change state of selected month", () => {
        render(
            <Provider store={store}>
                <TimelineBar />
            </Provider>
        );
        
        const monthItems = screen.getAllByRole('menuitemradio', { name: 'month-item' });

        // Select a year.
        const monthSelection = monthItems.find(
            element => element.textContent!.replace(/\d/, '') === 'JAN') as HTMLElement;
        fireEvent.click(monthSelection);

        // Check for dispatch.
        expect(store.getState().timeline.month).toBe('jan');
    });
});