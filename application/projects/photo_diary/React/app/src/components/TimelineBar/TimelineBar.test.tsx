import React from 'react';
import { fireEvent, render, screen, waitForElement } from '@testing-library/react';
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


test("hovering over year selector expands year selection menu", () => {

});

test("clicks on year drawer items will change selected year", () => {

});


test("changes to selected year dispatches action to reducer", () => {

});