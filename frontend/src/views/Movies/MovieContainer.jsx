import React, {Component} from 'react';
import {Route, Switch} from "react-router-dom";
import Movies from "./Movies";
import Movie from "./Movie";

class MoviesContainer extends Component {

    render() {
        return (
            <Switch>
                <Route exact path="/movies" component={Movies}/>
                <Route path="/movies/:id" component={Movie}/>
            </Switch>

        );
    }
}

export default MoviesContainer;
