import { 
    createSlice, 
    createAsyncThunk,
    Action,
    AnyAction,
    isRejectedWithValue } from '@reduxjs/toolkit';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { RootState } from '../../app/store';
import { loginUrl, logoutUrl } from '../../app/App';


/* ==============================================================================
    Slice for handling OAuth authentication process.
    Receives authentication code from user and posts it to backend,
    exchanging it for access token.
============================================================================== */

/* ---------------------------------------------------------
    Async thunk for exchanging OAuth code for access token.
--------------------------------------------------------- */
export const exchangeOAuthCodeToken = createAsyncThunk(
    'login/exchangeOAuthCodeToken',
    async (request: oAuthCodeResponseType, { rejectWithValue }) => {
        // Async fetch 
        try {
            const response: AxiosResponse = await fetchAccessToken(loginUrl, request);
            if (response.status === 200) {
                // Returns promise status, handling done by extra reducer.
                return (await response.data);
            }
        } 
        catch (err) {
            // Errors handled by extra reducer.
            if (axios.isAxiosError(err)) {
                const error = err as AxiosError;
                return rejectWithValue(error.response!.data);
            }
            else {
                const error = err;
                return rejectWithValue(error);
            }
        }
    }
);


/* ----------------------------------
    Access token fetcher for thunk.
---------------------------------- */
export const fetchAccessToken = (loginUrl: string, request: oAuthCodeResponseType) => {
    const authCode = {
        'auth-code': request.code
    };

    const oAuthTokenPromise = Promise.resolve(
        axios({
            method: 'get',
            url: loginUrl,
            params: authCode,
            withCredentials: true
        })
    );

    return oAuthTokenPromise;
};


/* ---------------------------------------------------------
    Async thunk for invalidationg JWT token - logging out.
--------------------------------------------------------- */
export const logoutUser = createAsyncThunk(
    'login/logoutUser',
    async (request: LogoutType, { rejectWithValue }) => {
        // Async fetch 
        try {
            const response: AxiosResponse = await requestLogout(logoutUrl, request);
            if (response.status === 200) {
                // Returns promise status, handling done by extra reducer.
                return (await response.data);
            }
        } 
        catch (err) {
            // Errors handled by extra reducer.
            if (axios.isAxiosError(err)) {
                const error = err as AxiosError;
                return rejectWithValue(error.response!.data);
            }
            else {
                const error = err;
                return rejectWithValue(error);
            }
        }
    }
);


/* ----------------------------------
    Log out post method.
---------------------------------- */
export const requestLogout = (logoutUrl: string, request: LogoutType) => {
    const logoutThisUser = Promise.resolve(
        axios({
            method: 'post',
            url: logoutUrl,
            data: request,
            withCredentials: true
        })
    );
    return logoutThisUser;
};


/* -------------------------------
    Handles authenticating user.
------------------------------- */
// State for initial render.
const DEV_USER = {
    '_id': '',
    'name': 'Dev',
    'email': 'dev@email.com',
    'profilePic': '',
    'role': 'editor'
};

const initialState: LoginProps = {
    tokenResponse: 'idle',
    user: null,
    role: 'viewer',
    loggedIn: false
};

const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {},
    /* ----------------------------------------------------
        Reducers for authentication.
    ---------------------------------------------------- */
    extraReducers: (builder) => {
        builder
            /* ------------------------------------- 
                Updates state on successful fetch.
            ------------------------------------- */
            .addCase(exchangeOAuthCodeToken.fulfilled, (state, action) => {
                const data = action.payload;

                if (data.user === 'unauthorized') {
                    state.tokenResponse = 'error';
                    state.user = null;
                    state.role = 'viewer';
                    state.loggedIn = false;
                }
                else {
                    state.tokenResponse = 'successful';
                    state.user = data.user;
                    state.user!._id = JSON.parse(data.user._id);
                    state.role = data.user.role;
                    state.loggedIn = true;
                }
            })
            .addCase(logoutUser.fulfilled, (state, action) => {
                const data = action.payload

                // Log out user and reset to 'viewer' profile.
                if (data.user === 'logout') {
                    state.user = null;
                    state.role = 'viewer'
                    state.loggedIn = false;
                }
            })
            /* ------------------------------------
                Catches errors on authentication.
            ------------------------------------ */
            .addMatcher(isRejectedWithValue(exchangeOAuthCodeToken), (state, action) => {
                state.tokenResponse = 'error';
                state.user = null;
                state.role = 'viewer';
                state.loggedIn = false;
            })
    }
});



/* =====================================================================
    Helper functions.
===================================================================== */

/* -----------------------------------------------
    Helper for searching for cookie in document.
----------------------------------------------- */
export function getCookie(cookieKey: string) {
    const cookies: string = document.cookie;
    let cookieValue: string = '';

    const cookieEntry: Array<string> = cookies.split(' ')
        .filter(cookie => cookie.includes(cookieKey));
    
    if (cookieEntry[0]) {
        cookieValue = cookieEntry[0].split('=')[1].split(';')[0];
    }
    else {
        return 'key not found';
    }
        
    return cookieValue;
}


/* =====================================================================
    Types.
===================================================================== */
export interface LoginProps {
    [index: string]: string | boolean | null | UserProps,
    'tokenResponse': 'successful' | 'error' | 'idle',
    'user': UserProps | null,
    'role': 'viewer' | 'editor' | 'admin'
    'loggedIn': boolean
};

export type LogoutType = {
    'user': 'logout'
};

export interface UserProps {
    '_id': string,
    'name': string,
    'email': string,
    'profilePic': string
};

export interface oAuthCodeResponseType {
    [index: string]: string,
    'authuser': string,
    'code': string,
    'prompt': string,
    'scope': string
};

interface RejectedAction extends Action {
    error: Error
};
  
function isRejectedAction(action: AnyAction): action is RejectedAction {
    return action.type.endsWith('rejected');
}

// Selector for selection state.
export const login = (state: RootState) => state.login;

// Export actions, reducers.
const { actions, reducer } = loginSlice;
export const { } = actions;
export default reducer;
