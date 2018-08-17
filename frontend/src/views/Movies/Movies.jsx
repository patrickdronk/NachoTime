import React, {Component} from 'react';
import {Card, CardHeader, CardBody, Row, Col, Form, FormGroup, Input} from 'reactstrap';
import {PanelHeader} from '../../components';
import axios from "axios";
import {Link} from "react-router-dom";
import InfiniteScroll from 'react-infinite-scroller';

class Movies extends Component {
    constructor(props) {
        super(props);
        this.state = {movies: [], query: '', searchResult: []}
    }

    async componentWillMount() {
        const {data} = await axios.get("https://tv-v2.api-fetch.website/movies/1?sort=trending&order=-1");
        const {data: downloadedMovies} = await axios.get("http://localhost:3333/movies");

        const movies = data.map(movie => {
            downloadedMovies.forEach(downloadedMovie => {
                if (!movie.downloaded) {
                    movie.downloaded = movie._id === downloadedMovie.imdb_id;
                }
            });
            return movie;
        });

        this.setState({movies})
    }

    search = async (e) => {
        e.preventDefault();
        const {query} = this.state;
        const {data} = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=096bba66f505e38c48ce8f5966fab7f8&language=en-US&query=${query}&page=1`)
        this.setState({searchResult: data.results});
    };

    loadMore = async (page) => {
        console.log(page);
        const {data} = await axios.get(`https://tv-v2.api-fetch.website/movies/${page}?sort=trending&order=-1`);
        const {data: downloadedMovies} = await axios.get("http://localhost:3333/movies");

        const movies = data.map(movie => {
            downloadedMovies.forEach(downloadedMovie => {
                if (!movie.downloaded) {
                    movie.downloaded = movie._id === downloadedMovie.imdb_id;
                }
            });
            return movie;
        });

        this.setState({movies: [...this.state.movies, ...movies]})
    };

    renderMovies = () => {
        return (
          <InfiniteScroll
            pageStart={1}
            loadMore={this.loadMore}
            hasMore={true}
            loader={<div className="loader" key={0}>Loading ...</div>}
            useWindow={true}
            style={{width: '100%'}}
          >
              <ul className={'list-inline'}>
                  {this.state.movies.map((movie, key) => {
                      let opacity = 0.2;
                      if (movie.downloaded) {
                          opacity = 1.0
                      }
                      return (
                        <li className={"list-inline-item"} style={{marginLeft: 15}} key={key}>
                            <Link to={`${this.props.match.url}/${movie.imdb_id}`}>
                                <div
                                     style={{
                                         backgroundImage: `url(${movie.images.poster})`,
                                         height: 220,
                                         width: 140,
                                         backgroundSize: 'cover',
                                         marginBottom: 20,
                                         opacity: opacity
                                     }}
                                >
                                </div>
                            </Link>
                        </li>
                      );
                  })
                  }
              </ul>
          </InfiniteScroll>
        )
    };

    navigate = async (movie_id) => {
        const {data: {imdb_id}} = await axios.get(`https://api.themoviedb.org/3/movie/${movie_id}?api_key=096bba66f505e38c48ce8f5966fab7f8&language=en-US`)
        this.props.history.push(`/movies/${imdb_id}`);
    };

    renderSearchResults = () => {
        return (this.state.searchResult.map(movie => {
            console.log(movie);
            return (
              <Col className={'font-icon-list'}>
                  <div className="font-icon-detail"
                       onClick={() => this.navigate(movie.id)}
                       style={{
                           backgroundImage: `url(https://image.tmdb.org/t/p/w300_and_h450_bestv2/${movie.poster_path})`,
                           height: 220,
                           width: 140,
                           backgroundSize: 'cover',
                           marginBottom: 20,
                           opacity: 1
                       }}
                  >
                  </div>
              </Col>
            );
        }))
    };

    render() {
        return (
          <div>
              <PanelHeader size="sm"/>
              <div className="content">
                  <Row>
                      <Col md={12}>
                          <Card>
                              <CardHeader><h5 className="title">Movies</h5>
                                  <Form onSubmit={this.search}>
                                      <FormGroup>
                                          <Input type="text" name="email" id="exampleEmail"
                                                 value={this.state.query}
                                                 onChange={(e) => {
                                                     this.setState({query: e.target.value})
                                                 }}
                                                 placeholder="Search"/>
                                      </FormGroup>
                                  </Form></CardHeader>
                              <CardBody>
                                  <Row>
                                      {
                                          this.state.searchResult.length > 0 ? this.renderSearchResults() : this.renderMovies()
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
