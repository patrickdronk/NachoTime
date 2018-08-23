import React from "react";
import {Redirect, Route} from "react-router-dom";

let PrivateRoute = ({component: Component, ...rest}) => {
        return (
            <Route {...rest}
                   render={props => {
                       // if we have no token in sessionStorage, redirect to login
                       if (sessionStorage.getItem('token') === null || sessionStorage.getItem('token') === undefined) {
                           return (<Redirect to={{pathname: "/login", state: {from: props.location}}}/>)
                       } else {
                           return (<Component {...props} />)
                       }
                   }}
            />
        )
    };

export default PrivateRoute
