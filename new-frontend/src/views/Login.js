import React, {Component} from 'react';
import {connect} from "react-redux";
import {Redirect} from "react-router-dom";
import {Button, Card, Col, Form, Icon, Input, Row} from "antd";
import logo from '../images/nacho.png';
import {notification} from 'antd';
import axios from 'axios';

const url = process.env.REACT_APP_API_SERVER;

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {email: '', password: ''};
    }

    onChange = (e) => {
        this.setState({[e.target.id]: e.target.value})
    };

    onSubmit = (e) => {
        e.preventDefault();
        this.login(this.state.email, this.state.password)
    };

    login = async (email, password) => {
        try {
            const {data} = await axios.post(`${url}/login`, {email, password});
            console.log(data);
            sessionStorage.setItem('token', data.token);
            this.setState({authenticated: true})
        } catch (e) {
            this.setState({authenticated: false});
            notification["error"]({
                message: 'Authenticatie mislukt',
                description: 'Controleer je gebruikersnaam & wachtwoord',
            });
        }
    };

    render() {
        if (this.state.authenticated) {
            return <Redirect to='/movies'/>
        }
        return (
          <div style={styles.body}>
              <Row justify={'center'} type={'flex'}>
                  <Col xs={20} md={12} xl={6}>
                      <Card style={{marginTop: '65px'}}>
                          <div style={styles.cardImage}>
                          </div>
                          <Form onSubmit={this.onSubmit}>
                              <Form.Item>
                                  <Input prefix={<Icon type="mail" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                         type={'email'}
                                         placeholder="Email"
                                         id={'email'}
                                         value={this.state.email}
                                         onChange={this.onChange}
                                  />
                              </Form.Item>
                              <Form.Item>
                                  <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                         type="password"
                                         placeholder="Password"
                                         id={'password'}
                                         value={this.state.password}
                                         onChange={this.onChange}
                                  />
                              </Form.Item>
                              <Form.Item>
                                  <Button size={'large'}
                                          type="primary"
                                          style={{width: '100%'}}
                                          htmlType={'submit'}
                                  >
                                      Log in
                                  </Button>
                              </Form.Item>
                          </Form>
                      </Card>
                  </Col>
              </Row>
          </div>

        )
    }
}

const styles = {
    body: {
        height: '100vh',
        backgroundRepeat: 'no-repeat',
        backgroundImage: 'linear-gradient(to right, rgb(83, 150, 209), rgb(91, 200, 171))'
    },
    cardImage: {
        background: `url(${logo})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100px',
        backgroundPosition: 'center',
        height: 100,
        marginBottom: 20
    }
};

const mapStateToProps = ({auth: {authenticated}}) => {
    return {authenticated}
};

const mapDispatch = ({auth: {login}}) => ({
    login: (email, password) => login({email, password})
});

export default connect(mapStateToProps, mapDispatch)(Login)
