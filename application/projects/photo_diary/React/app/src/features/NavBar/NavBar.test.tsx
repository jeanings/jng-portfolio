import React from 'react';
import { Provider } from 'react-redux';
import { setupStore, RootState } from '../../app/store';
import { 
    cleanup, 
    render, 
    screen, 
    waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import NavBar from './NavBar';

var user = userEvent.setup();

afterEach(() => {
    cleanup;
});


/* --------------------------------------
    Boilerplate for rendering document.
-------------------------------------- */
function renderBoilerplate(preloadedState?: RootState) {
    const newStore = setupStore(preloadedState);
    const container = render(
        <Provider store={newStore}>
            <NavBar />
        </Provider>
    );
    return { ...container, newStore };
}


/* =====================================================================
    Tests for menu button interactions
===================================================================== */
test("renders all main elements on initial load", () => {
    const { newStore } = renderBoilerplate();
    expect(screen.getByRole('menubar', { name: 'main site navigation menu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'open main site navigation menu' })).toBeInTheDocument();
});


test("clicks on menu toggle button reveals menu bar", async() => {
    const { newStore } = renderBoilerplate();
    const menubarElem = screen.getByRole('navigation', { name: 'main site navigation' });
    const menuToggleButton = screen.getByRole('button', { name: 'open main site navigation menu' });
    expect(menuToggleButton).toBeInTheDocument();
    expect(menubarElem).not.toHaveClass("toggle");

    await user.click(menuToggleButton);
    expect(menubarElem).toHaveClass("toggle");
});


test("hovering over resume button triggers toggle button background to match", async() => {
    const { newStore } = renderBoilerplate();
    const resumeMenuButton = screen.getByRole('menuitem', { name: 'main site resume link' });
    const menuToggleButton = screen.getByRole('button', { name: 'open main site navigation menu' });
    expect(menuToggleButton).toBeInTheDocument();

    // Click on toggle to open up menu.
    await user.click(menuToggleButton);

    expect(resumeMenuButton).toBeVisible();
    // Verify toggle button doesn't have background-matching class.
    expect(menuToggleButton).not.toHaveClass("blend");

    // Hover over resume button.
    await user.hover(resumeMenuButton);

    expect(menuToggleButton).toHaveClass("blend");
}); 