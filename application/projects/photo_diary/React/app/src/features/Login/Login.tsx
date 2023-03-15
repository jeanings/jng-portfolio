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

    const classBase: string = "Login";

    const onLoginSuccess = (codeResponse: any) => {
        console.log(codeResponse)
        dispatch(exchangeOAuthCodeToken(codeResponse))
    }


    const login = useGoogleLogin({
        onSuccess: codeResponse => { onLoginSuccess(codeResponse) },
        onError: errorResponse => console.log(errorResponse),
        flow: 'auth-code'
    });


    return (
        <button onClick={() => login()}>
            Sign in
        </button>
    );
}


/* =====================================================================
    Helper functions.
===================================================================== */




export default Login;
