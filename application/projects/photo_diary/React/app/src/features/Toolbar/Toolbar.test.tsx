import React from 'react';
import * as reactRedux from 'react-redux';
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
import '@testing-library/jest-dom';
import mockDefaultData from '../../utils/mockDefaultData.json';
import preloadedState from '../../utils/testHelpers';
import { 
    setStyleLoadStatus, 
    cleanupMarkerSource, 
    setSourceStatus,
    handleBoundsButton } from '../MapCanvas/mapCanvasSlice';
import { apiUrl } from '../../app/App';
import Toolbar from './Toolbar';
import FilterDrawer from '../FilterDrawer/FilterDrawer';
import SideFilmStrip from '../SideFilmStrip/SideFilmStrip';


var mockAxios = new MockAdapter(axios);
var user = userEvent.setup();

beforeEach(() => {
    mockAxios = new MockAdapter(axios);

    // Mock scrollTo.
    window.HTMLElement.prototype.scrollTo = jest.fn();

    // Mock IntersectionObserver.
    window.IntersectionObserver = jest.fn();
});

afterEach(() => {
    mockAxios.reset();
    jest.clearAllMocks(); 
    jest.resetAllMocks(); 
    jest.resetModules(); 
    cleanup;
});


/* --------------------------------------
    Boilerplate for rendering document.
-------------------------------------- */
function renderBoilerplate(components: Array<string>, preloadedState?: RootState) {
    const newStore = setupStore(preloadedState);
    const container = render(
        <Provider store={newStore}>
            <Toolbar />
            { components.includes('filter')
                ? <FilterDrawer />
                : <></> }
            { components.includes('filmStrip')
                ? <SideFilmStrip/>
                : <></> }
        </Provider>
    );
    return { ...container, newStore };
}


/* =====================================================================
    Tests for UI buttons on bottom of screen.
===================================================================== */
test("renders bottom UI buttons", async() => {
    const { newStore } = renderBoilerplate([]);

    await waitFor(() => screen.findByRole('menu', { name: 'toolbar' }));

    // Verify toolbar is rendered.
    const toolbar = screen.getByRole('menu', { name: 'toolbar' });
    expect(toolbar).toBeInTheDocument();

    // Verify individual toolbar buttons are rendered.
    const toolbarButtons = screen.getAllByRole('button');
    expect(toolbarButtons.length).toEqual(3);
});


test("clicks on toolbar buttons updates pressed status, style, and switched on/off state", async() => {
    const { newStore } = renderBoilerplate([]);

    await waitFor(() => screen.findByRole('menu', { name: 'toolbar' }));

    // Verify toolbar is rendered.
    const toolbar = screen.getByRole('menu', { name: 'toolbar' });
    expect(toolbar).toBeInTheDocument();

    // Verify individual toolbar buttons are rendered.
    const toolbarButtons = screen.getAllByRole('button');
    expect(toolbarButtons.length).toEqual(3);

    // Verify button is not clicked.
    const buttonToClick = screen.getByRole('button', { name: 'open filter drawer' });
    expect(buttonToClick).toHaveAttribute('aria-pressed', 'false');
    expect(buttonToClick).not.toHaveClass("active");

    await user.click(buttonToClick);

    // Verify button clicked.
    expect(newStore.getState().toolbar.filter).toEqual('on');
    expect(buttonToClick).toHaveAttribute('aria-pressed', 'true');
    expect(buttonToClick).toHaveClass("active");
});


test("drawer button clicks reveal, hide filter elements", async() => {
    const { newStore } = renderBoilerplate(['filter']);

    await waitFor(() => screen.findByRole('menu', { name: 'toolbar' }));

    // Verify toolbar is rendered.
    const toolbar = screen.getByRole('menu', { name: 'toolbar' });
    expect(toolbar).toBeInTheDocument();

    // Get target button.
    const toolbarFilterButton = screen.getByRole('button', { name: 'open filter drawer' });

    // Test opening of filter drawer.
    await user.click(toolbarFilterButton);
    expect(toolbarFilterButton.getAttribute('aria-pressed')).toEqual('true');
    expect(toolbarFilterButton).toHaveClass("active");

    await waitFor(() => screen.findByRole('form', { name: 'filters menu' }));
    const filterDrawerElem = screen.getByRole('form', { name: 'filters menu' });

    // Verify filter drawer is shown.
    expect(filterDrawerElem).toHaveClass("show");
    
    // Test closing of filter drawer.
    await user.click(toolbarFilterButton);
    expect(toolbarFilterButton.getAttribute('aria-pressed')).toEqual('false');
    expect(toolbarFilterButton).not.toHaveClass("active");

    // Verify filter drawer is hidden.
    expect(filterDrawerElem).not.toHaveClass("show");
});


test("clicks on either 'filter drawer' or 'image enlarger' button hides the other", async() => {
    const { newStore } = renderBoilerplate(['filter', 'filmStrip']);

    await waitFor(() => screen.findByRole('menu', { name: 'toolbar' }));
    await waitFor(() => screen.findByRole('tab', { name: 'image enlarger' }));
    await waitFor(() => screen.findByRole('form', { name: 'filters menu' }));

    const imageEnlargerElem = screen.getByRole('tab', { name: 'image enlarger' });
    const filterDrawerElem = screen.getByRole('form', { name: 'filters menu' });
    expect(imageEnlargerElem).toBeInTheDocument();
    expect(filterDrawerElem).toBeInTheDocument();

    // Verify toolbar is rendered.
    const toolbar = screen.getByRole('menu', { name: 'toolbar' });
    expect(toolbar).toBeInTheDocument();

    expect(newStore.getState().toolbar.imageEnlarger).toEqual('off');

    // Get target button.
    const imageEnlargerButton = screen.getByRole('button', { name: 'open image enlarger' });
   
    await waitFor(() => user.click(imageEnlargerButton));

    expect(newStore.getState().toolbar.imageEnlarger).toEqual('on');
    expect(newStore.getState().toolbar.filter).toEqual('off');
    expect(imageEnlargerElem).toHaveClass("show");
    expect(filterDrawerElem).not.toHaveClass("show");
    
    // Repeat for filter drawer button.
    const filterDrawerButton = screen.getByRole('button', { name: 'open filter drawer' });
   
    await user.click(filterDrawerButton);
    
    expect(newStore.getState().toolbar.filter).toEqual('on');
    expect(newStore.getState().toolbar.imageEnlarger).toEqual('off');
    expect(filterDrawerElem).toHaveClass("show");
    expect(imageEnlargerElem).not.toHaveClass("show");
});


test("disables image enlarger button if no film strip image clicked", async() => {
    const { newStore } = renderBoilerplate(['filmStrip'], preloadedState);

    await waitFor(() => screen.findByRole('menu', { name: 'toolbar' }));

    // Verify << enlargeDoc >> state is null.
    expect(newStore.getState().sideFilmStrip.enlargeDoc).toBeNull();

    const imageEnlargerButton = screen.getByRole('button', { name: 'open image enlarger' }); 

    // Verify image enlarger button is disabled.
    expect(imageEnlargerButton).toHaveClass("unavailable");
});


test("bounds button calls mapbox's fitBounds method", async() => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl, { params: { 'year': 'default' } })
        .replyOnce(200, mockDefaultData)

    // Mocked React functions.
    const useDispatchSpy = jest.spyOn(reactRedux, 'useDispatch');
    const mockDispatch = jest.fn();
    useDispatchSpy.mockReturnValue(mockDispatch);
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

    const { newStore } = renderBoilerplate([], preloadedState);
    
    // Mock dispatches for layer-adding conditions.
    newStore.dispatch(setStyleLoadStatus(true));
    newStore.dispatch(cleanupMarkerSource('idle'));
    newStore.dispatch(setSourceStatus('loaded'));
    
    // Verify states are updated.
    await waitFor(() => expect(newStore.getState().mapCanvas).toEqual({
        'styleLoaded': true,
        'markersStatus': 'idle', 
        'sourceStatus': 'loaded',
        'fitBoundsButton': 'idle',
        'markerLocator': 'idle'
    }));

    // Verify individual toolbar buttons are rendered.
    const toolbarButtons = screen.getAllByRole('button');
    expect(toolbarButtons.length).toEqual(3);

    // Get target button.
    const toolbarBoundsButton = screen.getByRole('button', { name: 'reset map bounds' });

    // Mock dispatch request to fitBounds.
    await user.click(toolbarBoundsButton);
    newStore.dispatch(handleBoundsButton('clicked'));

    // Verify state updated.
    await waitFor(() => expect(newStore.getState().mapCanvas.fitBoundsButton).toEqual('clicked'));
});