import "babel-polyfill";
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';


import 'bootstrap/dist/css/bootstrap.css';
import './assets/scss/now-ui-dashboard.css';
import './assets/css/demo.css';

import indexRoutes from './routes/index.jsx';


ReactDOM.render(
    <Router>
        <Switch>
            {
                indexRoutes.map((prop,key) => {
                    return (
                        <Route
                            path={prop.path}
                            key={key}
                            component={prop.component}
                        />
                    );
                })
            }
        </Switch>
    </Router>
, document.getElementById('root'));
