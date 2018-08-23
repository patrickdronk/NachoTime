import axios from 'axios';
import {notification} from 'antd';

//  Understanding models is as simple as answering a few questions:
//  What is my initial state? state
//  How do I change the state? reducers
//  How do I handle async actions? effects with async/await

export const auth = {
    state: {
        authenticated: false,
        authFailed: false
    },
    reducers: {
        setAuth(state, authenticated) {
            return {...state, authenticated: authenticated}
        },
        setAuthFailed(state,) {
            return {...state, authFailed: true}
        }
    },
    effects: {
        async login(payload, rootState) {
            // try {
            //     const {data} = await axios.post(`${address}/login`, {email: payload.email, password: payload.password});
            //     axios.defaults.headers.common['Authorization'] = `Bearer ${data.token.token}`;
            //     sessionStorage.setItem('token', data.token.token);
            //     this.setAuth(true);
            // } catch (e) {
            //     this.setAuth(false);
            //     this.setAuthFailed(true);
            //     notification["error"]({
            //         message: 'Authenticatie mislukt',
            //         description: 'Controleer je gebruikersnaam & wachtwoord',
            //     });
            // }
        }
    }
};


export const skillCollections = {
    state: {
        skillCollection: []
    },
    reducers: {
        // handle state changes with pure functions
        setSkillCollection(state, skillCollection) {
            return {...state, skillCollection}
        },
        addSkillToSkillCollection(state, skillCollection) {
            return {...state, skillCollection: [...state.skillCollection, skillCollection]}
        }
    },
    effects: (dispatch) => ({
        // handle state changes with impure functions.
        // use async/await for async actions
        async getSkillCollection() {
            try {
                const {data} = await axios.get("http://matrix.patrickdronk.me/skillcollections");
                this.setSkillCollection(data);
            } catch (e) {
                console.log(e);
                notification["error"]({
                    message: `Er is iets fout gegaan, probeer het later nog eens! Error: ${e.response.data.error.message}`
                });
            }
        },

        async addSkillCollection(name) {
            try {
                const {data} = await axios.post("http://matrix.patrickdronk.me/skillcollections", {name});
                this.addSkillToSkillCollection(data)
            } catch (e) {
                console.log(e);
                notification["error"]({message: `Er is iets fout gegaan, probeer het later nog eens! Error: ${e.response.data.error.message}`});
            }
        }
    })
}

// note a
