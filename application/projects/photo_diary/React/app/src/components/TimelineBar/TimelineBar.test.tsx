import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimelineBar from './TimelineBar';



test("renders year selector", () => {
    render(<TimelineBar />);
    expect(screen.getByRole('menubar', { name: 'year_selector' })).toBeInTheDocument();
});


test("renders selected year", () => {
    render(<TimelineBar />);
    expect(screen.getByRole('menuitem', { name: 'year_selected' })).toBeInTheDocument();
});

/*
test("hovering over year selector expands year selection menu", () => {
    render(<TimelineBar />);
    
    const yearSelector = screen.getByRole('menubar', { name: 'year_selector'} );
    
    fireEvent.mouseOver(yearSelector);
    await waitFor(() => screen.findBy);
});
*/


test("renders list of selectable years", () => {
    render(<TimelineBar />);

    const yearSelectorItems = screen.getAllByRole('menuitemradio');
    expect(yearSelectorItems.length).toBeGreaterThanOrEqual(1);     // *** refactor when using API
})


test("clicks on year drawer items will change selected year", async() => {
    render(<TimelineBar />);

    // Check for all radios to be false.
    const yearSelectorItems = screen.getAllByRole('menuitemradio');
    yearSelectorItems.forEach(element => {
        expect(element).toHaveAttribute('aria-checked', 'false');
    });

    // Select a year.
    const yearSelect = screen.getByRole('menuitemradio', { name: '2015' });
    fireEvent.click(yearSelect);

    // Check for aria-checked status.
    expect(yearSelect.ariaChecked).toEqual(true);

    // Check for actual change in selected year.
    const yearSelector = screen.getByLabelText('year_selected');
    await waitFor(() => 
        expect(yearSelector).toHaveTextContent('2015')
    );
});


test("changes to selected year dispatches action to reducer", () => {

});