import { 
    createSlice, 
    createAsyncThunk,
    Action,
    AnyAction } from '@reduxjs/toolkit';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { RootState } from '../../app/store';
import { getCookie } from '../Login/loginSlice';
import { MetadataEditInputType } from '../SideFilmStrip/ImageEnlarger'
import { ImageDocTypes } from '../TimelineBar/timelineSlice';
import { updateUrl, createUrl } from '../../app/App';


/* ==============================================================================
    Slice for handling CRUD operations while logged into editor role.
    Updates handled directly in ImageEnlarger component.
    Uploads handled in new component.
============================================================================== */

/* -----------------------------------------------------
    Async thunk for updating shown enlarged image doc.
----------------------------------------------------- */
export const updateDoc = createAsyncThunk(
    'editor/updateDoc',
    async (request: UpdateRequestDocType, { rejectWithValue }) => {
        // Async fetch.
        try {
            const response: AxiosResponse = await requestUpdate(updateUrl, request);
            if (response.status === 200) {
                // Returns promise status, handling done by extra reducer.
                return (await response.data);
            }
            else if (response.status === 401) {
                return rejectWithValue(response.data)
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


/* ---------------------
    Update doc method.
--------------------- */
export const requestUpdate = (updateUrl: string, request: UpdateRequestDocType) => {
    // Include X-CSRF token for validation.
    const headers = {
        'X-CSRF-TOKEN': getCookie('csrf_access_token')
    };

    const UpdateThisDoc = Promise.resolve(
        axios({
            method: 'patch',
            url: updateUrl,
            data: request,
            headers: headers,
            withCredentials: true
        })
    );

    return UpdateThisDoc;
};


/* -------------------------------------------
    Handles CRUD operations for editor mode.
------------------------------------------- */
const initialState: EditorProps = {
    response: 'idle',
    message: null,
    updated: {}
};

const editorSlice = createSlice({
    name: 'editor',
    initialState,
    reducers: {
        /* ----------------------------------------
            Handles clearing << updated >> state.
        ---------------------------------------- */
        handleUpdatedDocsClear: (state, action) => {
            const confirmation: ClearUpdatedDocsType = action.payload;
            if (confirmation.msg === 'clear updated docs') {
                state.updated = {};
            }
        }
    },
    /* ----------------------------------------------------
        Reducers for edit requests.
    ---------------------------------------------------- */
    extraReducers: (builder) => {
        builder
            /* ------------------------------------- 
                Updates state on successful edit operations.
            ------------------------------------- */
            .addCase(updateDoc.fulfilled, (state, action) => {
                const data = action.payload;
                // Add updated doc data to state, 
                // for displaying updated metadata without refetching entire collection.
                state.response = data.updateStatus;
                state.message = data.updateMessage;
                state.updated[data.updatedDoc._id] = data.updatedDoc;
            })
            /* --------------------------------------- 
                Catches errors on fetching from API.
            --------------------------------------- */
            .addMatcher(isRejectedAction, (state, action) => {
                state.response = 'failed';
                state.message = "DB/network error!"
                let message: string = '';
                if (action.payload) {
                    message = 'msg' in action.payload 
                        ? `--> ${action.payload['msg']}`
                        : '';
                }
                console.log(`Error: ${action.type} ${message}`);
            })
    }
});



/* =====================================================================
    Helper functions.
===================================================================== */

/* =====================================================================
    Types.
===================================================================== */
export interface EditorProps {
    [index: string]: string | null | UpdatedDocsType
    'response': 'idle' | 'successful' | 'passed with error' | 'failed',
    'message': string | null,
    'updated': UpdatedDocsType
};

export type UpdateRequestDocType = {
    [index: string]: ImageDocTypes['_id'] | ImageDocTypes['date']['year'] | MetadataEditInputType
    'id': ImageDocTypes['_id'],
    'collection': ImageDocTypes['date']['year']
    'fields': MetadataEditInputType
};

export type UpdatedDocsType = {
    [index: string]: ImageDocTypes
};

export type ClearUpdatedDocsType = {
    [index: string]: string,
    'msg': 'clear updated docs'
};

export interface UserProps {
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
    payload: any;
    error: Error
};
  
function isRejectedAction(action: AnyAction): action is RejectedAction {
    return action.type.endsWith('rejected');
}

// Selector for selection state.
export const editor = (state: RootState) => state.editor;

// Export actions, reducers.
const { actions, reducer } = editorSlice;
export const { handleUpdatedDocsClear } = actions;
export default reducer;
