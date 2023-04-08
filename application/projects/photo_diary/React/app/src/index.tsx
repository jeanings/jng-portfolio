import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './index.css';
import App from './app/App';
import { store } from './app/store';
import { GoogleOAuthProvider } from '@react-oauth/google';
import * as serviceWorker from './serviceWorker';


const GAE_OAUTH_CLIENT_ID = process.env.REACT_APP_GAE_OAUTH_CLIENT_ID as string;

ReactDOM.render(
    <React.StrictMode>
        <Provider store={ store }>
            <GoogleOAuthProvider clientId={ GAE_OAUTH_CLIENT_ID }>
                <App />
            </GoogleOAuthProvider>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
