import { 
    createSlice, 
    createAsyncThunk,
    Action,
    AnyAction } from '@reduxjs/toolkit';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { RootState } from '../../app/store';
import { loginUrl } from '../../app/App';


/* ==============================================================================
    Slice for handling OAuth authentication process.
    Receives authentication code from user and posts it to backend,
    exchanging it for access token.
============================================================================== */
// axios.defaults.withCredentials = true;

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
    }

    const oAuthTokenPromise = Promise.resolve(
        axios.get(loginUrl, { 
            params: authCode,
            withCredentials: true
        })
    );

    return oAuthTokenPromise;
};


/* -------------------------------
    Handles authenticating user.
------------------------------- */
// State for initial render.
const initialState: LoginProps = {
    tokenResponse: 'idle',
    user: 'default'
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
                }
                else {
                    state.user = data.user;
                    state.tokenResponse = 'successful';
                }
            })
            /* --------------------------------------- 
                Catches errors on fetching from API.
            --------------------------------------- */
            .addMatcher(isRejectedAction, (state, action) => {
                state.tokenResponse = 'error';
            })
    }
});



/* =====================================================================
    Helper functions.
===================================================================== */
export function getCookie(cookieKey: string) {
    const cookies: string = document.cookie;

    const cookieValue: string = cookies.split(' ')
        .filter(cookie => cookie.includes(cookieKey))[0]
        .split('=')[1]
        .split(';')[0];
    
    return cookieValue;
}


/* =====================================================================
    Types.
===================================================================== */
export interface LoginProps {
    [index: string]: string | UserProps,
    'tokenResponse': 'successful' | 'error' | 'idle',
    'user': 'default' | UserProps
};

interface UserProps {
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
