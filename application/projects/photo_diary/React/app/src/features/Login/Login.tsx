import React from 'react';
import { 
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries } from '../../common/hooks';
import { useGoogleLogin } from '@react-oauth/google';
import { exchangeOAuthCodeToken } from './loginSlice';


/* ====================================================================
    A main component - user login.
==================================================================== */
const Login: React.FunctionComponent = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.login.user);
    const loggedIn = useAppSelector(state => state.login.loggedIn);
    const classBase: string = "Login";

    const onLoginSuccess = (codeResponse: any) => {
        dispatch(exchangeOAuthCodeToken(codeResponse))
    }

    const login = useGoogleLogin({
        onSuccess: codeResponse => { onLoginSuccess(codeResponse) },
        onError: errorResponse => console.log(errorResponse),
        flow: 'auth-code'
    });
    
    const logout = () => {
        // TODO
        console.log('log out func')
    };

    return (
        <div>
            <button onClick={ !loggedIn
                // Pass in login or logout function.
                ? () => login()
                : () => logout() }>

                { !loggedIn
                    ? "Log in"
                    : "Log out" }
            </button>
        </div>
    );
};


/* =====================================================================
    Helper functions.
===================================================================== */




export default Login;
