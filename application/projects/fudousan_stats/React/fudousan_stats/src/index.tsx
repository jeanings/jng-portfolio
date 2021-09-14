import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './index.css';
import App from './App';
import { store } from './store';
import * as serviceWorker from './serviceWorker';

var FontFaceObserver = require('fontfaceobserver');
export const fontDotGothic = new FontFaceObserver('DotGothic16');
export const fontKaiseiOpti = new FontFaceObserver('Kaisei Opti');
export const fontMPlus = new FontFaceObserver('M PLUS 1p');


ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);


// Types setting
type FontsProps = {
  [index: string] : string | any
}

// const render: React.FC = () => {
//   ReactDOM.render(
//     <Provider store={store}>
//       <App />,
//     </Provider>,
//     document.getElementById('root')
//   );
// }
// render();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
