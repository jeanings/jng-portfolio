import React from 'react';
import { Provider } from 'react-redux';
import { setupStore } from '../app/store';
import {
    cleanup,
    render,
    screen } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { GoogleOAuthProvider } from '@react-oauth/google';
import '@testing-library/jest-dom';
import App, { apiUrl } from './App';

var mockAxios = new MockAdapter(axios);

beforeAll(() => {
    mockAxios = new MockAdapter(axios);
});

afterAll(() => {
    mockAxios.reset();
    cleanup;
});


/* =====================================================================
    Test for all features to be rendered.
===================================================================== */
test("renders all features on initial load", () => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(apiUrl).reply(200, []);

    // Mock scrollTo.
    window.HTMLElement.prototype.scrollTo = jest.fn();

    // Mock IntersectionObserver.
    window.IntersectionObserver = jest.fn();
    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */
    
    const newStore = setupStore();
    render(
        <Provider store={newStore}>
            <GoogleOAuthProvider clientId={ 'some-client-id' }>
                <App />
            </GoogleOAuthProvider>
        </Provider>
    );
    
    expect(screen.getByRole('menubar', { name: 'main site navigation menu' })).toBeInTheDocument();
    expect(screen.getByRole('menu', { name: 'timeline selector' })).toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'filters menu'} )).toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'map'} )).toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'images panel'} )).toBeInTheDocument();
    expect(screen.getByRole('menu', { name: 'toolbar'} )).toBeInTheDocument();
});