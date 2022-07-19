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

    expect(screen.getByRole('menubar', { name: 'year_selector' })).toBeInTheDocument();
});


test("renders selected year", () => {
    render(
        <Provider store={store}>
            <TimelineBar />
        </Provider>
    );

    expect(screen.getByRole('menuitem', { name: 'year_selected' })).toBeInTheDocument();
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
    afterAll(() => {
        cleanup();
    });

    test("changes year on click", async() => {
        render(
            <Provider store={store}>
                <TimelineBar />
            </Provider>
        );
    
        // Check for all radios to be false.
        const yearSelectorItems = screen.getAllByRole('menuitemradio');
        yearSelectorItems.forEach(element => {
            expect(element).toHaveAttribute('aria-checked', 'false');
        });
    
        // Select a year.
        const yearSelect = screen.getByText('2015', { exact: true });
        fireEvent.click(yearSelect);
    
        // Check for aria-checked status.
        expect(yearSelect.ariaChecked).toEqual(true);
    
        // Check for actual change in selected year.
        const yearSelector = screen.getByLabelText('year_selected');
        await waitFor(() => 
            expect(yearSelector).toHaveTextContent('2015')
        );
    });

    test("dispatches and change state of selected year", () => {
        render(
            <Provider store={store}>
                <TimelineBar />
            </Provider>
        );

        // Select a year.
        const yearSelect = screen.getByText('2015', { exact: true });
        fireEvent.click(yearSelect);

        // Check for dispatch.
        expect(store.getState().timeline.year).toBe('2015');
    });
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

    expect(screen.getByRole('menubar', { name: 'month_selector' })).toBeInTheDocument();
});


test("renders list of selectable months", () => {
    render(
        <Provider store={store}>
            <TimelineBar />
        </Provider>
    );

    const monthSelectorItems = screen.getAllByRole('menuitemradio', { name: 'month_selector_item' });
    expect(monthSelectorItems.length).toBeGreaterThanOrEqual(13);
});
