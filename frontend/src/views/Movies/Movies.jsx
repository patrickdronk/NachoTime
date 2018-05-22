import React, {Component} from 'react';
import {Card, CardHeader, CardBody, Row, Col} from 'reactstrap';
import {PanelHeader} from '../../components';
import axios from "axios";
import {Link} from "react-router-dom";

class Movies extends Component {
    constructor(props) {
        super(props);
        this.state = {movies: []}
    }

    async componentWillMount() {
        const {data} = await axios.get("https://tv-v2.api-fetch.website/movies/1?sort=trending&order=-1");
        console.log(data);
        this.setState({movies: data})
    }

    render() {
        return (
            <div>
                <PanelHeader size="sm"/>
                <div className="content">
                    <Row>
                        <Col md={12}>
                            <Card>
                                <CardHeader><h5 className="title">Movies</h5></CardHeader>
                                <CardBody>
                                    <Row>
                                        {
                                            this.state.movies.map((movie, key) => {
                                                console.log(movie);
                                                return (
                                                    <Col className={'font-icon-list'} key={key}>
                                                        <Link to={`${this.props.match.url}/${movie.imdb_id}`}>
                                                            <div className="font-icon-detail"
                                                                 style={{
                                                                     backgroundImage: `url(${movie.images.poster})`,
                                                                     height: 220,
                                                                     width: 140,
                                                                     backgroundSize: 'cover',
                                                                     marginBottom: 20
                                                                 }}
                                                                 onClick={console.log}
                                                            >
                                                            </div>
                                                        </Link>
                                                    </Col>
                                                );
                                            })
                                        }
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

export default Movies;
