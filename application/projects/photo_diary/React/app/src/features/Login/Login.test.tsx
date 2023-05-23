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
import { loginUrl, logoutUrl } from '../../app/App';
import '@testing-library/jest-dom';
import { preloadedState, mockUser } from '../../utils/testHelpers';
import Login from './Login';
import { exchangeOAuthCodeToken, logoutUser } from './loginSlice';


var mockAxios = new MockAdapter(axios);
var user = userEvent.setup();
const mockCredentials = { "user": mockUser.owner };
// _id is double encoded from backend, hacky fix.
const idFromBackend = JSON.stringify(mockCredentials.user._id)
mockCredentials.user._id = idFromBackend;

beforeEach(() => {
    mockAxios = new MockAdapter(axios);
});

afterEach(() => {
    mockAxios.reset();
    jest.clearAllMocks();
    jest.restoreAllMocks();
    cleanup;
});


/* --------------------------------------
    Boilerplate for rendering document.
-------------------------------------- */
function renderBoilerplate(preloadedState: RootState) {
    const newStore = setupStore(preloadedState);
    const container = render(
        <Provider store={newStore}>
            <Login />
        </Provider>
    );
    return { ...container, newStore };
}


/* -----------------------
    Mocked Google OAuth.
----------------------- */
jest.mock('@react-oauth/google');
const codeResponse = {
    "code": "some-hashed-Google-oauth-code",
    "scope": "email profile openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
    "authuser": "0",
    "prompt": "consent"
};
const setCookie1 = 'access_token_cookie=access-token-cookie-value; HttpOnly; Path=/';
const setCookie2 = 'csrf_access_token=csrf-access-token-value; Path=/';
const clearedSetCookie1 = 'access_token_cookie=; HttpOnly; Path=/';
const clearedSetCookie2 = 'csrf_access_token=; Path=/';


test("gets login credentials on successful sign-ins", async() => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(loginUrl)
        .reply((config) => {
            // Mock Set-Cookie from backend.
            config.headers = {...config.headers, 
                'Set-Cookie1': setCookie1,
                'Set-Cookie2': setCookie2
            };
            return [200, mockCredentials];
        });
 
    // Mocked React functions.
    const useDispatchSpy = jest.spyOn(reactRedux, 'useDispatch');
    const mockDispatch = jest.fn();
    useDispatchSpy.mockReturnValue(mockDispatch);

    // Mocked React-OAuth.
    const reactOAuth = require('@react-oauth/google');

    const mockOnLoginSuccess = jest.fn(() => {
        // Mock onLoginSuccess function in Login component.
        mockDispatch(exchangeOAuthCodeToken(codeResponse))
    });

    jest.spyOn(reactOAuth, 'useGoogleLogin')
        .mockImplementation(() => {
            return mockOnLoginSuccess
        });

    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

    const { newStore } = renderBoilerplate(preloadedState);

    // Verify mocked initialization.
    await waitFor(() => expect(newStore.getState().timeline.responseStatus).toEqual('idle'));
    
    // Check sign-in button exists.
    await screen.findByRole('button', { name: "login using Google OAuth" });
    const oAuthButton = screen.getByRole('button', { name: 'login using Google OAuth'});
    await waitFor(() => expect(oAuthButton).toBeInTheDocument());

    // Verify user isn't logged in.
    expect(newStore.getState().login.loggedIn).toEqual(false);

    // Click to mock sign-in.
    await user.click(oAuthButton);
    expect(mockOnLoginSuccess).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalled();

    // Mock dispatch to thunk.
    await waitFor(() => {
        newStore.dispatch(exchangeOAuthCodeToken(codeResponse));
    });

    // Verify get request called.
    expect(mockAxios.history.get.length).toEqual(1);
    const mockedResponse = mockAxios.history.get[0];
    // Verify request send with credentials.
    expect(mockedResponse.withCredentials).toEqual(true);
    // Verify mocked "set cookies" were sent in response.
    expect(mockedResponse.headers).toBeDefined();
    expect(mockedResponse.headers!['Set-Cookie1']).toEqual(setCookie1);
    expect(mockedResponse.headers!['Set-Cookie2']).toEqual(setCookie2);

    // Verify successful retrieval of user profile.    
    expect(newStore.getState().login.loggedIn).toEqual(true);
    expect(typeof newStore.getState().login.user).toEqual('object');
});


test("logout sets user to 'visitor' and response from backend removes access token cookies", async() => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(loginUrl)
        .reply((config) => {
            // Mock Set-Cookie from backend.
            config.headers = {...config.headers, 
                'Set-Cookie1': setCookie1,
                'Set-Cookie2': setCookie2
            };
            return [200, mockCredentials];
        })
    mockAxios
        .onPost(logoutUrl, { 'user': 'logout' } )
        .reply((config) => {
            // Mock Set-Cookie from backend.
            config.headers = {...config.headers, 
                'Set-Cookie1': clearedSetCookie1,
                'Set-Cookie2': clearedSetCookie2
            };
            return [200, { "user": "logout" }];
        });
 
    // Mocked React functions.
    const useDispatchSpy = jest.spyOn(reactRedux, 'useDispatch');
    const mockDispatch = jest.fn();
    useDispatchSpy.mockReturnValue(mockDispatch);

    // Mocked React-OAuth.
    const reactOAuth = require('@react-oauth/google');
 
    const mockOnLoginSuccess = jest.fn(() => {
        // Mock onLoginSuccess function in Login component.
        mockDispatch(exchangeOAuthCodeToken(codeResponse))
    });

    jest.spyOn(reactOAuth, 'useGoogleLogin')
        .mockImplementation(() => {
            return mockOnLoginSuccess
        });

    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

    const { newStore } = renderBoilerplate(preloadedState);

    // Verify mocked initialization.
    await waitFor(() => expect(newStore.getState().timeline.responseStatus).toEqual('idle'));
    
    // Check sign-in button exists.
    await screen.findByRole('button', { name: "login using Google OAuth" });
    const oAuthButton = screen.getByRole('button', { name: 'login using Google OAuth'});
    await waitFor(() => expect(oAuthButton).toBeInTheDocument());

    // Verify user isn't logged in.
    expect(newStore.getState().login.loggedIn).toEqual(false);

    // Mock dispatch to thunk.
    await waitFor(() => {
        newStore.dispatch(exchangeOAuthCodeToken(codeResponse));
    });

    // Verify get request called.
    expect(mockAxios.history.get.length).toEqual(1);
    const mockedGetResponse = mockAxios.history.get[0];
    // Verify request send with credentials.
    expect(mockedGetResponse.withCredentials).toEqual(true);
    // Verify mocked "set cookies" were sent in response.
    expect(mockedGetResponse.headers).toBeDefined();
    expect(mockedGetResponse.headers!['Set-Cookie1']).toEqual(setCookie1);
    expect(mockedGetResponse.headers!['Set-Cookie2']).toEqual(setCookie2);

    // Verify successful retrieval of user profile.    
    expect(newStore.getState().login.loggedIn).toEqual(true);
    expect(typeof newStore.getState().login.user).toEqual('object');

    // Logout using OAuth button.
    await user.click(oAuthButton);
    // Mock dispatch to thunk.
    await waitFor(() => {
        newStore.dispatch(logoutUser({ 'user': 'logout' }));
    })

    // Verify post request called.
    expect(mockAxios.history.post.length).toEqual(1);
    const mockedPostResponse = mockAxios.history.post[0];
    // Verify mocked "set cookies" were sent in response.
    expect(mockedPostResponse.headers).toBeDefined();
    expect(mockedPostResponse.headers!['Set-Cookie1']).toEqual(clearedSetCookie1);
    expect(mockedPostResponse.headers!['Set-Cookie2']).toEqual(clearedSetCookie2);

    // Verify successful logout.    
    expect(newStore.getState().login.loggedIn).toEqual(false);
    expect(newStore.getState().login.user).toEqual(null);
});


test("error from auth code to access token exchange keeps user in visitor role", async() => {
    /* --------------------------------------------------------
        Mocks                                          start
    -------------------------------------------------------- */
    // Mocked Axios calls.
    mockAxios = new MockAdapter(axios);
    mockAxios
        .onGet(loginUrl)
        .reply(401, { 'user': 'unauthorized' });
   
    // Mocked React functions.
    const useDispatchSpy = jest.spyOn(reactRedux, 'useDispatch');
    const mockDispatch = jest.fn();
    useDispatchSpy.mockReturnValue(mockDispatch);

    // Mocked React-OAuth.
    const reactOAuth = require('@react-oauth/google');
 
    const mockOnLoginSuccess = jest.fn(() => {
        // Mock onLoginSuccess function in Login component.
        mockDispatch(exchangeOAuthCodeToken(codeResponse))
    });

    jest.spyOn(reactOAuth, 'useGoogleLogin')
        .mockImplementation(() => {
            return mockOnLoginSuccess
        });

    /* --------------------------------------------------------
        Mocks                                            end
    -------------------------------------------------------- */

    const { newStore } = renderBoilerplate(preloadedState);

    // Verify mocked initialization.
    await waitFor(() => expect(newStore.getState().timeline.responseStatus).toEqual('idle'));
    
    // Check sign-in button exists.
    await screen.findByRole('button', { name: "login using Google OAuth" });
    const oAuthButton = screen.getByRole('button', { name: 'login using Google OAuth'});
    await waitFor(() => expect(oAuthButton).toBeInTheDocument());

    // Verify user isn't logged in.
    expect(newStore.getState().login.loggedIn).toEqual(false);

    // Mock dispatch to thunk.
    await waitFor(() => {
        newStore.dispatch(exchangeOAuthCodeToken(codeResponse));
    });

    // Verify get request called.
    expect(mockAxios.history.get.length).toEqual(1);
    const mockedGetResponse = mockAxios.history.get[0];
    // Verify request send with credentials.
    expect(mockedGetResponse.withCredentials).toEqual(true);

    // Verify error in login state.
    expect(newStore.getState().login.tokenResponse).toEqual('error');
    expect(newStore.getState().login.loggedIn).toEqual(false);
});