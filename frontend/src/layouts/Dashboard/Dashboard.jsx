import React from 'react';
import Ws from '@adonisjs/websocket-client'
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from 'perfect-scrollbar';
import {
  Route,
  Switch,
  Redirect
} from 'react-router-dom';

import {Header, Footer, Sidebar} from '../../components'

import dashboardRoutes from '../../routes/dashboard.jsx';
import {Alert, Progress} from "reactstrap";

let ps;

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    const ws = Ws('ws://localhost:3333');
    ws.connect();
    const chat = ws.subscribe('progress');

    chat.on('message', (progress) => {
      this.setState({progress});
    });
  }

  componentDidMount() {
    if (navigator.platform.indexOf('Win') > -1) {
      ps = new PerfectScrollbar(this.refs.mainPanel);
      document.body.classList.toggle("perfect-scrollbar-on");
    }
  }

  componentWillUnmount() {
    if (navigator.platform.indexOf('Win') > -1) {
      ps.destroy();
      document.body.classList.toggle("perfect-scrollbar-on");
    }
  }

  componentDidUpdate(e) {
    if (e.history.action === "PUSH") {
      this.refs.mainPanel.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
    }
  }

  render() {
    console.log(this.state);
    return (
      <div>
        <div className="wrapper">
          <Sidebar {...this.props} routes={dashboardRoutes}/>
          <div className="main-panel" ref="mainPanel">
            <Header {...this.props}/>
            {this.state.progress &&
            <Alert color="info" style={{width: '600', zIndex: 1,  position: 'fixed', top: '1em', right: '1em'}}>
              <p>{this.state.progress.movieTitle}</p>
              <div className="text-center">{this.state.progress.newPercentage}%</div>
              <Progress value={this.state.progress.newPercentage} />
            </Alert>
            }
            <Switch>
              {
                dashboardRoutes.map((prop, key) => {
                  if (prop.collapse) {
                    return prop.views.map((prop2, key2) => {
                      return (
                        <Route path={prop2.path} component={prop2.component} key={key2}/>
                      );
                    })
                  }
                  if (prop.redirect)
                    return (
                      <Redirect from={prop.path} to={prop.pathTo} key={key}/>
                    );
                  return (
                    <Route path={prop.path} component={prop.component} key={key}/>
                  );
                })
              }
            </Switch>
            <Footer fluid/>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
