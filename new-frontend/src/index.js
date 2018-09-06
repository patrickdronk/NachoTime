import "babel-polyfill";
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { init } from '@rematch/core'
import * as models from './models/models'
import {Provider} from "react-redux";
import moment from 'moment';
import 'moment/locale/nl';
const store = init({
    models,
});

ReactDOM.render(
  <Provider store={store}>
      <App/>
  </Provider>,
  document.getElementById('root'));
registerServiceWorker();
