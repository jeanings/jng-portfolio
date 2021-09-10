import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './index.css';
import App from './App';
import { store } from './store';
import * as serviceWorker from './serviceWorker';



var WebFont = require('webfontloader');
WebFont.load({
  google: {
    families: [
      'DotGothic16:400',
      'Kaisei Opti:400',
      'M PLUS 1p:100,300'
    ]
  }
});


ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);


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
