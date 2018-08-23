import React, {Component} from 'react';
import {Layout, Menu, Icon, Tooltip, notification} from 'antd';
import {Route} from "react-router-dom";
import Movies from "./movies/Movies";
import Movie from "./movies/Movie";
import Ws from '@adonisjs/websocket-client'
import MyProgress from "./movies/MyProgress"

import('./Dashboard.css');
const {Header, Sider, Content} = Layout;
const url = process.env.REACT_APP_WS_API_SERVER;

class Dashboard extends Component {
    state = {
        collapsed: false,
    };

    constructor(props) {
        super(props);

        const ws = Ws(url);
        ws.connect();
        const socket = ws.subscribe('torrent');

        socket.on('torrent.progress', (progress) => {
            notification.open({
                key: progress.movieTitle,
                duration: 0,
                message: progress.movieTitle,
                description: <MyProgress progress={progress.newPercentage}/>,
            });
        });
    }

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };

    changeRoute = (item) => {
        this.props.history.push(`${item.key}`)
    };

    logout = () => {

    };

    render() {
        const {location} = this.props;
        return (
          <Layout>
              <Sider
                trigger={null}
                collapsible
                collapsed={this.state.collapsed}
              >
                  <div className="logo"/>
                  <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} onClick={this.changeRoute}>
                      <Menu.Item key="/movies">
                          <Icon type="user" />
                          <span>Movies</span>
                      </Menu.Item>
                  </Menu>
              </Sider>
              <Layout>
                  <Header style={{background: '#fff', padding: 0}}>
                      <Icon className="trigger" type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                            onClick={this.toggle}/>
                      <Tooltip title="Logout">
                          <Icon className="trigger"
                                type={'logout'}
                                onClick={this.logout}
                                style={{float: 'right'}}
                          />
                      </Tooltip>
                  </Header>
                  <Content style={{margin: '24px 16px', padding: 24, background: '#fff'}}>
                      <Route exact path={"/movies"} component={Movies}/>
                      <Route path={"/movies/:id"} component={Movie}/>
                  </Content>
              </Layout>
          </Layout>
        );
    }
}

export default Dashboard;
