import React, {Component} from 'react';
import './App.css';
import {BrowserRouter as Router, Route} from 'react-router-dom'
import Login from "./views/Login";
import Dashboard from "./views/Dashboard";
import {Switch} from "react-router";
import PrivateRoute from "./components/PrivateRoute";

class App extends Component {
    render() {
        return (
          <Router>
              <Switch>
                  <Route path={"/login"} component={Login}/>
                  <PrivateRoute path={"/"} component={Dashboard}/>
              </Switch>
          </Router>
        );
    }
}

export default App;
