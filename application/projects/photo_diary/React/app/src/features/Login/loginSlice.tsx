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

/* ---------------------------------------------------------
    Async thunk for exchanging OAuth code for access token.
--------------------------------------------------------- */
export const exchangeOAuthCodeToken = createAsyncThunk(
    'login/exchangeOAuthCodeToken',
    async (request: oauthCodeResponseType, { rejectWithValue }) => {
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


/* --------------------------------
    Access token fetcher for thunk.
-------------------------------- */
export const fetchAccessToken = (loginUrl: string, request: oauthCodeResponseType) => {
    const authCode = {
        'auth-code': request.code
    }

    const oauthTokenPromise = Promise.resolve(
        axios.get(
            loginUrl, { 
                params: authCode,
            }
        )
    );

    return oauthTokenPromise;
}


/* ------------------------------------------
    Handles updates to timeline selection.
------------------------------------------ */
// State for initial render.
const initialState: LoginProps = {
    tokenResponse: null
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
                state.tokenResponse = data;
            })
            /* --------------------------------------- 
                Catches errors on fetching from API.
            --------------------------------------- */
            .addMatcher(isRejectedAction, (state, action) => {
                state.responseStatus = 'error';
            })
    },
});


/* =====================================================================
    Types.
===================================================================== */
export interface LoginProps {
    [index: string]: string | null,
    'tokenResponse': any
};

export interface oauthCodeResponseType {
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
};

// Selector for selection state.
export const login = (state: RootState) => state.login;

// Export actions, reducers.
const { actions, reducer } = loginSlice;
export const { } = actions;
export default reducer;
