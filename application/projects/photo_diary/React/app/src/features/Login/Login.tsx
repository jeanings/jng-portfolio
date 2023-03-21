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
            <button onClick={ user === 'default'
                ? () => login()
                : () => logout() }>

                { user === 'default'
                    ? "Log in"
                    : "Log out " + user.name }
            </button>
        </div>
    );
};


/* =====================================================================
    Helper functions.
===================================================================== */




export default Login;
