import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './index.css';
import App from './App';
import { store } from './store';
import * as serviceWorker from './serviceWorker';

/* ------------------------------
  FontFace objects declaration
------------------------------ */
var FontFaceObserver = require('fontfaceobserver');
export const fontHinaMincho = new FontFaceObserver('Hina Mincho');  // serif
export const fontKaiseiOpti = new FontFaceObserver('Kaisei Opti');  // serif
export const fontMPlus = new FontFaceObserver('M PLUS 1p');         // sans-serif


ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
