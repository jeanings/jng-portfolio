import React from 'react';
import { 
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries } from '../../common/hooks';
import { useGoogleLogin } from '@react-oauth/google';
import { exchangeOAuthCodeToken, logoutUser, UserProps } from './loginSlice';
import './Login.css';


/* ====================================================================
    A main component - user login.
==================================================================== */
const Login: React.FunctionComponent = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.login.user);
    const isEditor = useAppSelector(state => state.login.role) === 'editor' ? true : false;
    const classBase: string = "Login";

    /* --------------------------------------------
        Handle app logins, passing code to thunk.
    -------------------------------------------- */    
    const onLoginSuccess = (codeResponse: any) => {
        // Dispatch oauth code to backend to obtain access token / user profile.
        dispatch(exchangeOAuthCodeToken(codeResponse));
    };

    /* -------------------------------------------
        Handle Google OAuth login for auth code.
    ------------------------------------------- */        
    const login = useGoogleLogin({
        onSuccess: codeResponse => onLoginSuccess(codeResponse),
        onError: errorResponse => console.log(errorResponse),
        flow: 'auth-code'
    });
    
    /* ---------------------
        Handle app logout.
    --------------------- */    
    const logout = () => {
        // Request backend to invalidate active JWT token.
        dispatch(logoutUser({ 'user': 'logout' }))
    };

    return (
        <div 
            className={ useMediaQueries(classBase) }>
            <button 
                className={ useMediaQueries(`${classBase}__button`)
                +   // Change styling based on logged status.
                    (isEditor === true
                        ? " " + "authorized"
                        : "") }
                aria-label="login using Google OAuth"
                onClick={ !isEditor
                    // Pass in login or logout function.
                    ? () => login()
                    : () => logout() }>


                <svg 
                    className={ useMediaQueries(`${classBase}__button__indicator`) 
                        +   // Change styling based on logged status.
                        (isEditor === true
                            ? " " + "authorized"
                            : "") }
                    xmlns='http://www.w3.org/2000/svg' 
                    viewBox='0 0 24 24' fill='#000000' 
                    width='24' height='24'>
                    <path d="M7 17a5.007 5.007 0 0 0 4.898-4H14v2h2v-2h2v3h2v-3h1v-2h-9.102A5.007 5.007 0 0 0 7 7c-2.757 0-5 2.243-5 5s2.243 5 5 5zm0-8c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.346-3 3-3z">
                    </path>
                </svg>

                { getUserIcon(isEditor, useMediaQueries(`${classBase}__button__user`), user) }
                
            </button>
        </div>
    );
};


/* =====================================================================
    Helper functions.
===================================================================== */
function getUserIcon(isLoggedIn: boolean, className: string, user: UserProps | null) {
    const unloggedUser = (
        <svg
            className={ className }
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 512 512">
            <path d="M258.9 48C141.92 46.42 46.42 141.92 48 258.9c1.56 112.19 92.91 203.54 205.1 205.1 117 1.6 212.48-93.9 210.88-210.88C462.44 140.91 371.09 49.56 258.9 48zm126.42 327.25a4 4 0 01-6.14-.32 124.27 124.27 0 00-32.35-29.59C321.37 329 289.11 320 256 320s-65.37 9-90.83 25.34a124.24 124.24 0 00-32.35 29.58 4 4 0 01-6.14.32A175.32 175.32 0 0180 259c-1.63-97.31 78.22-178.76 175.57-179S432 158.81 432 256a175.32 175.32 0 01-46.68 119.25z"/>
            <path d="M256 144c-19.72 0-37.55 7.39-50.22 20.82s-19 32-17.57 51.93C191.11 256 221.52 288 256 288s64.83-32 67.79-71.24c1.48-19.74-4.8-38.14-17.68-51.82C293.39 151.44 275.59 144 256 144z"/>
        </svg>
    );

    const loggedUser = (
        <img 
            className={ className
                +   // Change styling for authorized user
                (isLoggedIn === true
                    ? " " + "authorized"
                    : "") }
            src={ user !== null
                ? user.profilePic
                : "" }
            referrerPolicy='no-referrer'
        />
    );

    const userIcon = isLoggedIn === false
        ? unloggedUser
        : loggedUser;
    
    return userIcon;
}


export default Login;
